const API_BASE = "/api";
const TOKEN_KEY = "mapquest.token.v2";
const FLASH_KEY = "mapquest.flash.v1";

const el = {
  authForm: document.getElementById("authForm"),
  usernameInput: document.getElementById("usernameInput"),
  passwordInput: document.getElementById("passwordInput"),
  registerBtn: document.getElementById("registerBtn"),
  authHint: document.getElementById("authHint")
};

const auth = {
  token: localStorage.getItem(TOKEN_KEY) || "",
  user: null
};

init();

async function init() {
  registerServiceWorker();
  bindEvents();
  showFlashMessage();
  await redirectIfAuthenticated();
}

function bindEvents() {
  el.authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await login();
  });

  el.registerBtn.addEventListener("click", async () => {
    await register();
  });
}

async function redirectIfAuthenticated() {
  if (!auth.token) return;

  try {
    const response = await api("/auth/me", { token: auth.token });
    auth.user = response.user;
    redirectToGame();
  } catch (error) {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function login() {
  const username = el.usernameInput.value.trim();
  const password = el.passwordInput.value;

  if (!username || !password) {
    setAuthHint("Enter username and password.");
    return;
  }

  try {
    const response = await api("/auth/login", {
      method: "POST",
      body: { username, password }
    });

    localStorage.setItem(TOKEN_KEY, response.token);
    sessionStorage.removeItem(FLASH_KEY);
    redirectToGame();
  } catch (error) {
    setAuthHint(error.message);
  }
}

async function register() {
  const username = el.usernameInput.value.trim();
  const password = el.passwordInput.value;

  if (!username || !password) {
    setAuthHint("Enter username and password.");
    return;
  }

  try {
    const response = await api("/auth/register", {
      method: "POST",
      body: { username, password }
    });

    localStorage.setItem(TOKEN_KEY, response.token);
    sessionStorage.removeItem(FLASH_KEY);
    redirectToGame();
  } catch (error) {
    setAuthHint(error.message);
  }
}

async function api(path, options = {}) {
  const request = {
    method: options.method || "GET",
    headers: {}
  };

  if (options.token) {
    request.headers.Authorization = `Bearer ${options.token}`;
    request.headers["X-Auth-Token"] = options.token;
  }

  if (options.body !== undefined) {
    request.headers["Content-Type"] = "application/json";
    request.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${path}`, request);
  let payload = {};

  try {
    payload = await response.json();
  } catch (error) {
    payload = {};
  }

  if (!response.ok) {
    const message = payload.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

function setAuthHint(message) {
  el.authHint.textContent = message;
}

function showFlashMessage() {
  const flash = sessionStorage.getItem(FLASH_KEY);
  if (!flash) return;

  setAuthHint(flash);
  sessionStorage.removeItem(FLASH_KEY);
}

function redirectToGame() {
  window.location.replace("/game.html");
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  });
}
