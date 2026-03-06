const API_BASE = "/api";
const TOKEN_KEY = "mapquest.token.v2";
const FLASH_KEY = "mapquest.flash.v1";

const DEFAULT_DATA = {
  settings: {
    startHearts: 3,
    maxHearts: 5
  },
  map: {
    title: "Grove of Questions",
    backgroundType: "gradient",
    backgroundValue: "linear-gradient(135deg, #a8d8c3, #f0e4d0)",
    imageUrl: "",
    showGrid: true,
    nodes: [
      { id: "node-1", levelId: 1, label: "1", x: 10, y: 82 },
      { id: "node-2", levelId: 2, label: "2", x: 26, y: 60 },
      { id: "node-3", levelId: 3, label: "3", x: 45, y: 72 },
      { id: "node-4", levelId: 4, label: "4", x: 60, y: 44 },
      { id: "node-5", levelId: 5, label: "5", x: 76, y: 62 },
      { id: "node-6", levelId: 6, label: "6", x: 90, y: 30 }
    ]
  },
  characters: [
    {
      id: "char-1",
      name: "Nova",
      role: "player",
      shape: "circle",
      color: "#ef7f3b",
      size: 48,
      x: 14,
      y: 82,
      imageUrl: ""
    },
    {
      id: "char-2",
      name: "Moss",
      role: "npc",
      shape: "square",
      color: "#3fb39e",
      size: 40,
      x: 18,
      y: 88,
      imageUrl: ""
    }
  ],
  levels: [
    {
      id: 1,
      title: "Sky Guess",
      question: "What color is the sky on a clear day?",
      options: ["Blue", "Green", "Red", "Yellow"],
      answerIndex: 0,
      explanation: "Most clear daytime skies appear blue."
    },
    {
      id: 2,
      title: "Quick Math",
      question: "2 + 2 equals what?",
      options: ["3", "4", "5", "6"],
      answerIndex: 1,
      explanation: "Two plus two is four."
    },
    {
      id: 3,
      title: "Living Things",
      question: "Which is a mammal?",
      options: ["Dolphin", "Shark", "Trout", "Octopus"],
      answerIndex: 0,
      explanation: "Dolphins breathe air and nurse their young."
    },
    {
      id: 4,
      title: "World Map",
      question: "Which continent is the Sahara Desert on?",
      options: ["Asia", "Africa", "Europe", "South America"],
      answerIndex: 1,
      explanation: "The Sahara is in northern Africa."
    },
    {
      id: 5,
      title: "Word Match",
      question: "Which word is a synonym for fast?",
      options: ["Quick", "Slow", "Late", "Still"],
      answerIndex: 0,
      explanation: "Quick means fast."
    },
    {
      id: 6,
      title: "Ocean Facts",
      question: "What is the largest ocean on Earth?",
      options: ["Atlantic", "Arctic", "Indian", "Pacific"],
      answerIndex: 3,
      explanation: "The Pacific is the largest ocean."
    }
  ]
};

const el = {
  hearts: document.getElementById("hearts"),
  resetBtn: document.getElementById("resetBtn"),
  adminBtn: document.getElementById("adminBtn"),
  map: document.getElementById("map"),
  mapTitle: document.getElementById("mapTitle"),
  progressText: document.getElementById("progressText"),
  levelTag: document.getElementById("levelTag"),
  questionText: document.getElementById("questionText"),
  options: document.getElementById("options"),
  feedback: document.getElementById("feedback"),
  retryBtn: document.getElementById("retryBtn"),
  nextBtn: document.getElementById("nextBtn"),
  questionActions: document.getElementById("questionActions"),
  adminModal: document.getElementById("adminModal"),
  adminClose: document.getElementById("adminClose"),
  adminTabs: document.getElementById("adminTabs"),
  adminMap: document.getElementById("adminMap"),
  adminCharacters: document.getElementById("adminCharacters"),
  adminLevels: document.getElementById("adminLevels"),
  adminSettings: document.getElementById("adminSettings"),
  adminAnalytics: document.getElementById("adminAnalytics"),
  resetDefaults: document.getElementById("resetDefaults"),
  exportBtn: document.getElementById("exportBtn"),
  importInput: document.getElementById("importInput"),
  saveBtn: document.getElementById("saveBtn"),
  saveHint: document.getElementById("saveHint"),
  userBar: document.getElementById("userBar"),
  userChip: document.getElementById("userChip"),
  logoutBtn: document.getElementById("logoutBtn"),
  authHint: document.getElementById("authHint")
};

const auth = {
  token: localStorage.getItem(TOKEN_KEY) || "",
  user: null
};

let data = null;
let state = null;
let draftData = null;
let analyticsSummary = null;
let adminTab = "map";
let actionLock = false;

init();

async function init() {
  registerServiceWorker();
  bindEvents();
  await bootstrap();
}

function bindEvents() {
  el.logoutBtn.addEventListener("click", async () => {
    await logout();
  });

  el.resetBtn.addEventListener("click", async () => {
    if (!auth.user) return;
    await resetRun();
  });

  el.retryBtn.addEventListener("click", () => {
    if (!state || !state.feedback || state.feedback.type !== "fail") return;
    state.feedback = null;
    renderQuestion();
  });

  el.nextBtn.addEventListener("click", async () => {
    if (!auth.user || !state || !state.readyNext) return;
    await advanceLevel();
  });

  el.adminBtn.addEventListener("click", async () => {
    await openAdmin();
  });

  el.adminClose.addEventListener("click", () => {
    closeAdmin();
  });

  el.adminTabs.addEventListener("click", async (event) => {
    const tab = event.target.closest("[data-tab]");
    if (!tab) return;
    setAdminTab(tab.dataset.tab);
    if (adminTab === "analytics") {
      await refreshAnalytics();
    }
  });

  el.resetDefaults.addEventListener("click", () => {
    if (!draftData) return;
    draftData = deepClone(DEFAULT_DATA);
    ensureNodes(draftData);
    renderAdmin();
    setSaveHint("Defaults loaded. Click Save Changes to persist.");
  });

  el.exportBtn.addEventListener("click", () => {
    if (!draftData) return;
    readAdminDraftFromDom();
    downloadJSON(draftData);
  });

  el.importInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        draftData = normalizeData(parsed);
        renderAdmin();
        setSaveHint("Imported JSON loaded. Click Save Changes to persist.");
      } catch (error) {
        setSaveHint("Import failed. Please use valid JSON.");
      }
    };
    reader.readAsText(file);
  });

  el.saveBtn.addEventListener("click", async () => {
    if (!draftData || !isAdmin()) return;
    readAdminDraftFromDom();

    try {
      const response = await api("/admin/game-data", {
        method: "PUT",
        body: { data: draftData }
      });

      data = normalizeData(response.data);
      const progressResponse = await api("/progress");
      state = normalizeState(progressResponse.state, data);
      draftData = deepClone(data);
      renderAll();
      renderAdmin();
      setSaveHint("Saved.");
    } catch (error) {
      setSaveHint(error.message);
    }
  });

  el.adminModal.addEventListener("click", async (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton || !draftData) return;

    const action = actionButton.dataset.action;
    const index = Number(actionButton.dataset.index);

    if (action.startsWith("upload-") || action === "refresh-analytics") {
      await handleUploadAction(action, index);
      return;
    }

    readAdminDraftFromDom();

    if (action === "add-node") {
      const nodes = draftData.map.nodes;
      const generated = autoLayoutNodes(draftData.levels.length);
      nodes.push(generated[nodes.length] || {
        id: `node-${nodes.length + 1}`,
        levelId: draftData.levels[nodes.length]?.id || nodes.length + 1,
        label: String(nodes.length + 1),
        x: 50,
        y: 50
      });
    }

    if (action === "remove-node") {
      draftData.map.nodes.splice(index, 1);
    }

    if (action === "auto-layout") {
      draftData.map.nodes = autoLayoutNodes(draftData.levels.length);
    }

    if (action === "sync-nodes") {
      ensureNodes(draftData);
    }

    if (action === "add-character") {
      draftData.characters.push({
        id: `char-${draftData.characters.length + 1}`,
        name: `Character ${draftData.characters.length + 1}`,
        role: "npc",
        shape: "circle",
        color: "#ef7f3b",
        size: 44,
        x: 50,
        y: 60,
        imageUrl: ""
      });
    }

    if (action === "remove-character") {
      draftData.characters.splice(index, 1);
    }

    if (action === "add-level") {
      const nextId = draftData.levels.length + 1;
      draftData.levels.push({
        id: nextId,
        title: `Level ${nextId}`,
        question: "New question",
        options: ["Option A", "Option B"],
        answerIndex: 0,
        explanation: ""
      });
    }

    if (action === "remove-level") {
      draftData.levels.splice(index, 1);
    }

    if (action === "move-level-up" && index > 0) {
      const level = draftData.levels[index];
      draftData.levels.splice(index, 1);
      draftData.levels.splice(index - 1, 0, level);
    }

    if (action === "move-level-down" && index < draftData.levels.length - 1) {
      const level = draftData.levels[index];
      draftData.levels.splice(index, 1);
      draftData.levels.splice(index + 1, 0, level);
    }

    ensureNodes(draftData);
    ensureCharacters(draftData);
    renderAdmin();
  });
}

async function bootstrap() {
  if (auth.token) {
    try {
      const response = await api("/auth/me");
      auth.user = response.user;
    } catch (error) {
      clearSession();
      redirectToLogin("Session expired. Please log in again.");
      return;
    }
  }

  if (!auth.user) {
    redirectToLogin("Please log in to continue.");
    return;
  }

  renderAuth();
  await loadGame();
}

function isAdmin() {
  return auth.user && auth.user.role === "admin";
}

function setAuthHint(message) {
  el.authHint.textContent = message;
}

function setSaveHint(message) {
  el.saveHint.textContent = message;
}

function clearSession() {
  auth.token = "";
  auth.user = null;
  localStorage.removeItem(TOKEN_KEY);
}

async function logout() {
  try {
    if (auth.token) {
      await api("/auth/logout", { method: "POST", allow401: true });
    }
  } catch (error) {
    // Ignore logout errors, local session should still be cleared.
  }

  clearSession();
  data = null;
  state = null;
  draftData = null;
  closeAdmin();
  redirectToLogin("Logged out.");
}

function renderAuth() {
  if (auth.user) {
    el.userChip.textContent = `${auth.user.username} (${auth.user.role})`;
  }

  el.adminBtn.disabled = !isAdmin();
}

async function loadGame() {
  if (!auth.user) return;

  try {
    const [gameResponse, progressResponse] = await Promise.all([
      api("/game-data"),
      api("/progress")
    ]);

    data = normalizeData(gameResponse.data);
    state = normalizeState(progressResponse.state, data);
    renderAll();
  } catch (error) {
    clearSession();
    redirectToLogin(error.message);
  }
}

function renderAll() {
  renderHearts(data.settings.maxHearts, state.hearts);
  renderMap();
  renderQuestion();
  renderProgress();
}

function renderHearts(maxHearts, filledHearts) {
  el.hearts.innerHTML = "";
  for (let i = 0; i < maxHearts; i += 1) {
    const heart = document.createElement("div");
    heart.className = "heart" + (i < filledHearts ? " filled" : "");
    el.hearts.appendChild(heart);
  }
}

function renderMap() {
  el.map.innerHTML = "";
  el.mapTitle.textContent = data.map.title;

  if (data.map.backgroundType === "image" && data.map.imageUrl) {
    el.map.style.background = `url(${data.map.imageUrl}) center / cover`;
  } else {
    el.map.style.background = data.map.backgroundValue;
  }

  el.map.classList.toggle("no-grid", !data.map.showGrid);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 100 100");

  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute(
    "points",
    data.map.nodes.map((node) => `${node.x},${node.y}`).join(" ")
  );
  polyline.setAttribute("class", "map-path");
  svg.appendChild(polyline);
  el.map.appendChild(svg);

  data.map.nodes.forEach((node, index) => {
    const resolvedIndex = resolveLevelIndex(node.levelId, index);
    const level = data.levels[resolvedIndex];
    const levelId = level?.id;
    const isCompleted = Boolean(state.completed[String(levelId)]);
    const isCurrent = resolvedIndex === state.currentLevelIndex;
    const isLocked = !isCompleted && resolvedIndex > state.currentLevelIndex && !state.finished;

    const nodeEl = document.createElement("button");
    nodeEl.type = "button";
    nodeEl.className = "node";
    nodeEl.disabled = isLocked || actionLock;
    if (isCompleted) nodeEl.classList.add("completed");
    if (isCurrent) nodeEl.classList.add("current");
    if (isLocked) nodeEl.classList.add("locked");
    nodeEl.style.left = `${node.x}%`;
    nodeEl.style.top = `${node.y}%`;

    const label = document.createElement("span");
    label.textContent = node.label;
    nodeEl.appendChild(label);

    nodeEl.addEventListener("click", async () => {
      if (actionLock || resolvedIndex === state.currentLevelIndex) return;
      if (!isCompleted) return;
      await selectLevel(resolvedIndex);
    });

    el.map.appendChild(nodeEl);
  });

  renderCharacters();
}

function renderCharacters() {
  const nodes = data.map.nodes;
  const currentLevelId = data.levels[state.currentLevelIndex]?.id;
  const currentNode =
    nodes.find((node) => Number(node.levelId) === Number(currentLevelId)) ||
    nodes[state.currentLevelIndex] ||
    nodes[0];

  const playerCharacters = data.characters.filter((character) => character.role === "player");
  const npcCharacters = data.characters.filter((character) => character.role !== "player");

  playerCharacters.forEach((character, index) => {
    const offset = index * 2;
    const position = currentNode
      ? {
          x: clamp(currentNode.x + offset, 2, 98),
          y: clamp(currentNode.y - offset, 5, 95)
        }
      : { x: character.x, y: character.y };

    el.map.appendChild(buildCharacter(character, position));
  });

  npcCharacters.forEach((character) => {
    el.map.appendChild(buildCharacter(character, { x: character.x, y: character.y }));
  });
}

function buildCharacter(character, position) {
  const wrapper = document.createElement("div");
  wrapper.className = `character ${character.shape}`;
  wrapper.style.left = `${position.x}%`;
  wrapper.style.top = `${position.y}%`;
  wrapper.style.width = `${character.size}px`;
  wrapper.style.height = `${character.size}px`;
  wrapper.style.background = character.color;

  if (character.imageUrl) {
    const image = document.createElement("img");
    image.src = character.imageUrl;
    image.alt = character.name;
    wrapper.appendChild(image);
  }

  return wrapper;
}

function renderQuestion() {
  const level = data.levels[state.currentLevelIndex];

  el.levelTag.textContent = `Level ${state.currentLevelIndex + 1}`;
  el.options.innerHTML = "";
  el.feedback.textContent = "";
  el.feedback.className = "feedback";

  if (state.hearts <= 0) {
    el.questionText.textContent = "Out of hearts. Reset run to try again.";
    el.questionActions.classList.add("hidden");
    return;
  }

  if (state.finished) {
    el.questionText.textContent = "Trail complete. You finished every level.";
    el.questionActions.classList.add("hidden");
    return;
  }

  el.questionText.textContent = level.question;

  level.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-btn";
    button.textContent = option;
    button.disabled = state.readyNext || actionLock;
    button.addEventListener("click", async () => {
      await submitAnswer(index);
    });

    el.options.appendChild(button);
  });

  if (state.feedback) {
    el.feedback.textContent = state.feedback.text;
    el.feedback.classList.add(state.feedback.type === "correct" ? "success" : "fail");
  }

  el.retryBtn.classList.toggle("hidden", !state.feedback || state.feedback.type !== "fail");
  el.nextBtn.classList.toggle("hidden", !state.readyNext);
  el.questionActions.classList.toggle("hidden", !state.feedback);
}

function renderProgress() {
  if (!data || !state) {
    el.progressText.textContent = "Locked";
    return;
  }

  if (state.finished) {
    el.progressText.textContent = "Run complete";
  } else {
    el.progressText.textContent = `Level ${state.currentLevelIndex + 1} of ${data.levels.length}`;
  }
}

async function submitAnswer(answerIndex) {
  if (!auth.user || !data || !state || actionLock) return;

  actionLock = true;
  renderQuestion();

  try {
    const response = await api("/progress/answer", {
      method: "POST",
      body: { answerIndex }
    });

    state = normalizeState(response.state, data);
    renderAll();
  } catch (error) {
    setAuthHint(error.message);
  } finally {
    actionLock = false;
    renderQuestion();
  }
}

async function advanceLevel() {
  if (!auth.user || !state || actionLock) return;

  actionLock = true;
  try {
    const response = await api("/progress/next", { method: "POST" });
    state = normalizeState(response.state, data);
    renderAll();
  } catch (error) {
    setAuthHint(error.message);
  } finally {
    actionLock = false;
    renderQuestion();
  }
}

async function selectLevel(levelIndex) {
  if (!auth.user || !state || actionLock) return;

  actionLock = true;
  try {
    const response = await api("/progress/select", {
      method: "POST",
      body: { levelIndex }
    });

    state = normalizeState(response.state, data);
    renderAll();
  } catch (error) {
    setAuthHint(error.message);
  } finally {
    actionLock = false;
    renderQuestion();
  }
}

async function resetRun() {
  if (!auth.user || actionLock) return;

  actionLock = true;
  try {
    const response = await api("/progress/reset", { method: "POST" });
    state = normalizeState(response.state, data);
    renderAll();
  } catch (error) {
    setAuthHint(error.message);
  } finally {
    actionLock = false;
    renderQuestion();
  }
}

async function openAdmin() {
  if (!auth.user) {
    setAuthHint("Login required.");
    return;
  }

  if (!isAdmin()) {
    setAuthHint("Admin role required.");
    return;
  }

  draftData = deepClone(data);
  analyticsSummary = null;
  el.adminModal.classList.remove("hidden");
  el.adminModal.setAttribute("aria-hidden", "false");
  setSaveHint("");
  renderAdmin();
}

function closeAdmin() {
  el.adminModal.classList.add("hidden");
  el.adminModal.setAttribute("aria-hidden", "true");
}

function setAdminTab(tabName) {
  adminTab = tabName;
  renderAdmin();
}

function renderAdmin() {
  if (!draftData) return;

  const tabs = el.adminTabs.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.tab === adminTab);
  });

  el.adminMap.classList.toggle("hidden", adminTab !== "map");
  el.adminCharacters.classList.toggle("hidden", adminTab !== "characters");
  el.adminLevels.classList.toggle("hidden", adminTab !== "levels");
  el.adminSettings.classList.toggle("hidden", adminTab !== "settings");
  el.adminAnalytics.classList.toggle("hidden", adminTab !== "analytics");

  renderAdminMap();
  renderAdminCharacters();
  renderAdminLevels();
  renderAdminSettings();
  renderAdminAnalytics();
}

function renderAdminMap() {
  el.adminMap.innerHTML = `
    <div class="field-grid">
      <label>Map title<input id="draft-map-title" class="input" value="${escapeHtml(
        draftData.map.title
      )}" /></label>
      <label>Background type
        <select id="draft-map-bg-type">
          <option value="gradient" ${
            draftData.map.backgroundType === "gradient" ? "selected" : ""
          }>Gradient</option>
          <option value="image" ${
            draftData.map.backgroundType === "image" ? "selected" : ""
          }>Image</option>
        </select>
      </label>
      <label>Gradient or color<input id="draft-map-bg-value" class="input" value="${escapeHtml(
        draftData.map.backgroundValue
      )}" /></label>
      <label>Image URL<input id="draft-map-bg-image" class="input" value="${escapeHtml(
        draftData.map.imageUrl
      )}" /></label>
      <label>Show grid
        <select id="draft-map-show-grid">
          <option value="true" ${draftData.map.showGrid ? "selected" : ""}>On</option>
          <option value="false" ${!draftData.map.showGrid ? "selected" : ""}>Off</option>
        </select>
      </label>
    </div>
    <div class="upload-row">
      <input id="mapImageUploadInput" class="input" type="file" accept="image/*" />
      <button class="btn ghost" data-action="upload-map-image" type="button">Upload map image</button>
    </div>
    <div class="list" id="nodeList">
      ${draftData.map.nodes
        .map(
          (node, index) => `
          <div class="list-row" data-index="${index}">
            <header>
              <strong>Node ${index + 1}</strong>
              <div class="row-actions">
                <button class="btn ghost" data-action="remove-node" data-index="${index}" type="button">Remove</button>
              </div>
            </header>
            <div class="field-grid">
              <label>ID<input data-field="id" class="input" value="${escapeHtml(node.id)}" /></label>
              <label>Level ID<input data-field="levelId" class="input" value="${escapeHtml(
                node.levelId
              )}" /></label>
              <label>Label<input data-field="label" class="input" value="${escapeHtml(
                node.label
              )}" /></label>
              <label>X%<input data-field="x" class="input" value="${escapeHtml(node.x)}" /></label>
              <label>Y%<input data-field="y" class="input" value="${escapeHtml(node.y)}" /></label>
            </div>
          </div>
        `
        )
        .join("")}
    </div>
    <div class="row-actions">
      <button class="btn ghost" data-action="add-node" type="button">Add node</button>
      <button class="btn ghost" data-action="auto-layout" type="button">Auto layout</button>
      <button class="btn ghost" data-action="sync-nodes" type="button">Sync to levels</button>
    </div>
    <p class="hint">Map image upload stores to backend uploads and auto-fills Image URL.</p>
  `;
}

function renderAdminCharacters() {
  el.adminCharacters.innerHTML = `
    <div class="list" id="characterList">
      ${draftData.characters
        .map(
          (character, index) => `
        <div class="list-row" data-index="${index}">
          <header>
            <strong>${escapeHtml(character.name)}</strong>
            <div class="row-actions">
              <button class="btn ghost" data-action="remove-character" data-index="${index}" type="button">Remove</button>
            </div>
          </header>
          <div class="field-grid">
            <label>ID<input data-field="id" class="input" value="${escapeHtml(character.id)}" /></label>
            <label>Name<input data-field="name" class="input" value="${escapeHtml(
              character.name
            )}" /></label>
            <label>Role
              <select data-field="role">
                <option value="player" ${character.role === "player" ? "selected" : ""}>Player</option>
                <option value="npc" ${character.role !== "player" ? "selected" : ""}>NPC</option>
              </select>
            </label>
            <label>Shape
              <select data-field="shape">
                <option value="circle" ${character.shape === "circle" ? "selected" : ""}>Circle</option>
                <option value="square" ${character.shape === "square" ? "selected" : ""}>Square</option>
              </select>
            </label>
            <label>Color<input data-field="color" type="color" class="input" value="${escapeHtml(
              character.color
            )}" /></label>
            <label>Size<input data-field="size" class="input" value="${escapeHtml(
              character.size
            )}" /></label>
            <label>X%<input data-field="x" class="input" value="${escapeHtml(character.x)}" /></label>
            <label>Y%<input data-field="y" class="input" value="${escapeHtml(character.y)}" /></label>
            <label>Image URL<input data-field="imageUrl" class="input" value="${escapeHtml(
              character.imageUrl
            )}" /></label>
          </div>
          <div class="upload-row">
            <input id="charUploadInput-${index}" class="input" type="file" accept="image/*" />
            <button class="btn ghost" data-action="upload-character-image" data-index="${index}" type="button">Upload image</button>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
    <div class="row-actions">
      <button class="btn ghost" data-action="add-character" type="button">Add character</button>
    </div>
  `;
}

function renderAdminLevels() {
  el.adminLevels.innerHTML = `
    <div class="list" id="levelList">
      ${draftData.levels
        .map(
          (level, index) => `
        <div class="list-row" data-index="${index}">
          <header>
            <strong>Level ${index + 1}</strong>
            <div class="row-actions">
              <button class="btn ghost" data-action="move-level-up" data-index="${index}" type="button">Up</button>
              <button class="btn ghost" data-action="move-level-down" data-index="${index}" type="button">Down</button>
              <button class="btn ghost" data-action="remove-level" data-index="${index}" type="button">Remove</button>
            </div>
          </header>
          <div class="field-grid">
            <label>Level ID<input data-field="id" class="input" value="${escapeHtml(level.id)}" /></label>
            <label>Title<input data-field="title" class="input" value="${escapeHtml(
              level.title
            )}" /></label>
          </div>
          <label>Question<textarea data-field="question">${escapeHtml(level.question)}</textarea></label>
          <label>Options (one per line)<textarea data-field="options">${escapeHtml(
            level.options.join("\n")
          )}</textarea></label>
          <div class="field-grid">
            <label>Correct option (1-based)<input data-field="answerIndex" class="input" value="${escapeHtml(
              level.answerIndex + 1
            )}" /></label>
          </div>
          <label>Explanation<textarea data-field="explanation">${escapeHtml(
            level.explanation
          )}</textarea></label>
        </div>
      `
        )
        .join("")}
    </div>
    <div class="row-actions">
      <button class="btn ghost" data-action="add-level" type="button">Add level</button>
    </div>
  `;
}

function renderAdminSettings() {
  el.adminSettings.innerHTML = `
    <div class="field-grid">
      <label>Start hearts<input id="draft-start-hearts" class="input" value="${escapeHtml(
        draftData.settings.startHearts
      )}" /></label>
      <label>Max hearts<input id="draft-max-hearts" class="input" value="${escapeHtml(
        draftData.settings.maxHearts
      )}" /></label>
    </div>
    <p class="hint">Hearts are capped at 5 by backend rule.</p>
  `;
}

function renderAdminAnalytics() {
  if (!analyticsSummary) {
    el.adminAnalytics.innerHTML = `
      <div class="analytics-grid">
        <div class="list-row">
          <strong>Analytics</strong>
          <p class="hint">Press refresh to load latest metrics.</p>
          <div class="row-actions">
            <button class="btn ghost" data-action="refresh-analytics" type="button">Refresh</button>
          </div>
        </div>
      </div>
    `;
    return;
  }

  el.adminAnalytics.innerHTML = `
    <div class="analytics-grid">
      <div class="metric-card"><p class="eyebrow">Users</p><h3>${analyticsSummary.totalUsers}</h3></div>
      <div class="metric-card"><p class="eyebrow">Active Today</p><h3>${analyticsSummary.activeToday}</h3></div>
      <div class="metric-card"><p class="eyebrow">Attempts</p><h3>${analyticsSummary.totalAttempts}</h3></div>
      <div class="metric-card"><p class="eyebrow">Accuracy</p><h3>${analyticsSummary.accuracyPercent}%</h3></div>
      <div class="metric-card"><p class="eyebrow">Completed Runs</p><h3>${analyticsSummary.completedRuns}</h3></div>
      <div class="metric-card"><p class="eyebrow">Wrong Answers</p><h3>${analyticsSummary.wrongAnswers}</h3></div>
    </div>
    <div class="list-row">
      <header>
        <strong>Top levels by wrong answers</strong>
        <div class="row-actions">
          <button class="btn ghost" data-action="refresh-analytics" type="button">Refresh</button>
        </div>
      </header>
      <div class="list">
        ${analyticsSummary.topLevels
          .map(
            (item) => `<div class="analytics-row">Level ${item.levelId}: wrong ${item.wrong}, correct ${item.correct}</div>`
          )
          .join("") || "<p class='hint'>No answer events yet.</p>"}
      </div>
    </div>
  `;
}

async function refreshAnalytics() {
  if (!isAdmin()) return;

  try {
    const response = await api("/admin/analytics");
    analyticsSummary = response.summary;
    renderAdminAnalytics();
  } catch (error) {
    setSaveHint(error.message);
  }
}

async function handleUploadAction(action, index) {
  if (!isAdmin() || !draftData) return;

  readAdminDraftFromDom();

  if (action === "upload-map-image") {
    const input = document.getElementById("mapImageUploadInput");
    const file = input?.files?.[0];
    if (!file) {
      setSaveHint("Choose a map image first.");
      return;
    }

    try {
      const response = await uploadFile(file);
      draftData.map.imageUrl = response.url;
      renderAdmin();
      setSaveHint("Map image uploaded.");
    } catch (error) {
      setSaveHint(error.message);
    }
    return;
  }

  if (action === "upload-character-image") {
    const input = document.getElementById(`charUploadInput-${index}`);
    const file = input?.files?.[0];
    if (!file) {
      setSaveHint("Choose a character image first.");
      return;
    }

    try {
      const response = await uploadFile(file);
      if (draftData.characters[index]) {
        draftData.characters[index].imageUrl = response.url;
      }
      renderAdmin();
      setSaveHint("Character image uploaded.");
    } catch (error) {
      setSaveHint(error.message);
    }
    return;
  }

  if (action === "refresh-analytics") {
    await refreshAnalytics();
  }
}

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  return api("/admin/upload", { method: "POST", form: formData });
}

function readAdminDraftFromDom() {
  if (!draftData) return;

  const mapTitle = document.getElementById("draft-map-title");
  const mapBgType = document.getElementById("draft-map-bg-type");
  const mapBgValue = document.getElementById("draft-map-bg-value");
  const mapBgImage = document.getElementById("draft-map-bg-image");
  const mapShowGrid = document.getElementById("draft-map-show-grid");

  if (mapTitle) draftData.map.title = mapTitle.value.trim() || draftData.map.title;
  if (mapBgType) draftData.map.backgroundType = mapBgType.value;
  if (mapBgValue) draftData.map.backgroundValue = mapBgValue.value.trim();
  if (mapBgImage) draftData.map.imageUrl = mapBgImage.value.trim();
  if (mapShowGrid) draftData.map.showGrid = mapShowGrid.value === "true";

  const nodeRows = el.adminMap.querySelectorAll(".list-row");
  draftData.map.nodes = Array.from(nodeRows).map((row, index) => {
    const getValue = (field) => row.querySelector(`[data-field="${field}"]`)?.value;
    return {
      id: getValue("id") || `node-${index + 1}`,
      levelId: safeNumber(getValue("levelId"), index + 1),
      label: getValue("label") || String(index + 1),
      x: clamp(safeNumber(getValue("x"), 50), 2, 98),
      y: clamp(safeNumber(getValue("y"), 50), 5, 95)
    };
  });

  const characterRows = el.adminCharacters.querySelectorAll(".list-row");
  draftData.characters = Array.from(characterRows).map((row, index) => {
    const getValue = (field) => row.querySelector(`[data-field="${field}"]`)?.value;
    return {
      id: getValue("id") || `char-${index + 1}`,
      name: getValue("name") || `Character ${index + 1}`,
      role: getValue("role") || "npc",
      shape: getValue("shape") || "circle",
      color: getValue("color") || "#ef7f3b",
      size: clamp(safeNumber(getValue("size"), 44), 24, 90),
      x: clamp(safeNumber(getValue("x"), 50), 2, 98),
      y: clamp(safeNumber(getValue("y"), 50), 2, 98),
      imageUrl: getValue("imageUrl") || ""
    };
  });

  const levelRows = el.adminLevels.querySelectorAll(".list-row");
  draftData.levels = Array.from(levelRows).map((row, index) => {
    const getValue = (field) => row.querySelector(`[data-field="${field}"]`)?.value;
    const options = (getValue("options") || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return {
      id: safeNumber(getValue("id"), index + 1),
      title: getValue("title") || `Level ${index + 1}`,
      question: getValue("question") || "New question",
      options: options.length ? options : ["Option A", "Option B"],
      answerIndex: clamp(safeNumber(getValue("answerIndex"), 1) - 1, 0, Math.max(options.length - 1, 0)),
      explanation: getValue("explanation") || ""
    };
  });

  const startHearts = document.getElementById("draft-start-hearts");
  const maxHearts = document.getElementById("draft-max-hearts");

  if (startHearts) {
    draftData.settings.startHearts = safeNumber(startHearts.value, 3);
  }

  if (maxHearts) {
    draftData.settings.maxHearts = safeNumber(maxHearts.value, 5);
  }

  draftData.settings.maxHearts = clamp(draftData.settings.maxHearts, 1, 5);
  draftData.settings.startHearts = clamp(
    draftData.settings.startHearts,
    1,
    draftData.settings.maxHearts
  );

  ensureLevelIds(draftData);
  ensureNodes(draftData);
  ensureCharacters(draftData);
}

async function api(path, options = {}) {
  const request = {
    method: options.method || "GET",
    headers: {}
  };

  if (auth.token) {
    request.headers.Authorization = `Bearer ${auth.token}`;
    request.headers["X-Auth-Token"] = auth.token;
  }

  if (options.form) {
    request.body = options.form;
  } else if (options.body !== undefined) {
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
    if (response.status === 401 && !options.allow401) {
      clearSession();
      redirectToLogin("Please log in to continue.");
    }

    const message = payload.error || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return payload;
}

function normalizeData(input) {
  const output = deepClone(DEFAULT_DATA);

  if (input && typeof input === "object") {
    output.settings = { ...output.settings, ...input.settings };
    output.map = { ...output.map, ...input.map };
    output.map.nodes = Array.isArray(input.map?.nodes) ? input.map.nodes : output.map.nodes;
    output.characters = Array.isArray(input.characters) ? input.characters : output.characters;
    output.levels = Array.isArray(input.levels) ? input.levels : output.levels;
  }

  output.settings.maxHearts = clamp(safeNumber(output.settings.maxHearts, 5), 1, 5);
  output.settings.startHearts = clamp(
    safeNumber(output.settings.startHearts, 3),
    1,
    output.settings.maxHearts
  );

  output.map.showGrid = Boolean(output.map.showGrid);
  output.map.backgroundType = output.map.backgroundType === "image" ? "image" : "gradient";
  output.map.backgroundValue = output.map.backgroundValue || DEFAULT_DATA.map.backgroundValue;
  output.map.imageUrl = output.map.imageUrl || "";

  if (!Array.isArray(output.levels) || output.levels.length === 0) {
    output.levels = deepClone(DEFAULT_DATA.levels);
  }

  ensureLevelIds(output);
  ensureNodes(output);
  ensureCharacters(output);
  return output;
}

function normalizeState(input, gameData) {
  const fallback = defaultState(gameData);
  if (!input || typeof input !== "object") return fallback;

  if (input.levelSignature !== fallback.levelSignature) {
    return fallback;
  }

  fallback.hearts = clamp(safeNumber(input.hearts, fallback.hearts), 0, fallback.maxHearts);
  fallback.currentLevelIndex = clamp(
    safeNumber(input.currentLevelIndex, 0),
    0,
    gameData.levels.length - 1
  );

  fallback.completed =
    typeof input.completed === "object" && input.completed ? input.completed : fallback.completed;
  fallback.feedback = input.feedback || null;
  fallback.readyNext = Boolean(input.readyNext);
  fallback.finished = Boolean(input.finished);

  return fallback;
}

function defaultState(gameData) {
  return {
    hearts: gameData.settings.startHearts,
    maxHearts: gameData.settings.maxHearts,
    currentLevelIndex: 0,
    completed: {},
    feedback: null,
    readyNext: false,
    finished: false,
    levelSignature: levelsSignature(gameData.levels)
  };
}

function ensureLevelIds(target) {
  target.levels.forEach((level, index) => {
    level.id = safeNumber(level.id, index + 1);
    level.title = level.title || `Level ${index + 1}`;
    level.question = level.question || "New question";

    if (!Array.isArray(level.options) || level.options.length < 2) {
      level.options = ["Option A", "Option B"];
    }

    level.answerIndex = clamp(
      safeNumber(level.answerIndex, 0),
      0,
      level.options.length - 1
    );
    level.explanation = level.explanation || "";
  });
}

function ensureNodes(target) {
  if (!Array.isArray(target.map.nodes)) target.map.nodes = [];
  const expected = target.levels.length;
  const nodes = target.map.nodes;

  if (nodes.length < expected) {
    const generated = autoLayoutNodes(expected);
    for (let i = nodes.length; i < expected; i += 1) {
      nodes.push(generated[i]);
    }
  }

  if (nodes.length > expected) {
    nodes.length = expected;
  }

  nodes.forEach((node, index) => {
    node.id = node.id || `node-${index + 1}`;
    node.levelId = safeNumber(node.levelId, target.levels[index]?.id || index + 1);
    node.label = node.label || String(index + 1);
    node.x = clamp(safeNumber(node.x, 50), 2, 98);
    node.y = clamp(safeNumber(node.y, 50), 5, 95);
  });
}

function ensureCharacters(target) {
  if (!Array.isArray(target.characters) || target.characters.length === 0) {
    target.characters = deepClone(DEFAULT_DATA.characters);
  }

  target.characters.forEach((character, index) => {
    character.id = character.id || `char-${index + 1}`;
    character.name = character.name || `Character ${index + 1}`;
    character.role = character.role || (index === 0 ? "player" : "npc");
    character.shape = character.shape || "circle";
    character.color = character.color || "#ef7f3b";
    character.size = clamp(safeNumber(character.size, 44), 24, 90);
    character.x = clamp(safeNumber(character.x, 50), 2, 98);
    character.y = clamp(safeNumber(character.y, 60), 2, 98);
    character.imageUrl = character.imageUrl || "";
  });

  if (!target.characters.some((character) => character.role === "player")) {
    target.characters[0].role = "player";
  }
}

function autoLayoutNodes(count) {
  const nodes = [];
  const cols = Math.min(6, count);
  const rows = Math.ceil(count / cols);
  const xStep = 100 / (cols + 1);
  const yStep = 70 / (rows + 1);

  for (let i = 0; i < count; i += 1) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const direction = row % 2 === 0 ? col : cols - 1 - col;
    nodes.push({
      id: `node-${i + 1}`,
      levelId: i + 1,
      label: String(i + 1),
      x: clamp((direction + 1) * xStep, 2, 98),
      y: clamp(15 + (row + 1) * yStep, 5, 95)
    });
  }

  return nodes;
}

function levelsSignature(levels) {
  return levels.map((level) => String(level.id)).join("|");
}

function resolveLevelIndex(levelId, fallbackIndex) {
  const foundIndex = data.levels.findIndex((level) => Number(level.id) === Number(levelId));
  return foundIndex === -1 ? fallbackIndex : foundIndex;
}

function downloadJSON(payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "map-quest-data.json";
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function safeNumber(value, fallback) {
  if (value === "" || value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  });
}

function redirectToLogin(message) {
  if (message) {
    sessionStorage.setItem(FLASH_KEY, message);
  }
  window.location.replace("/index.html");
}
