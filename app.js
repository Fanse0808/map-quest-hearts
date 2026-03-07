const API_BASE = "/api";
const TOKEN_KEY = "mapquest.token.v2";
const FLASH_KEY = "mapquest.flash.v1";

const DEFAULT_DATA = {
  settings: {
    startHearts: 3,
    maxHearts: 5,
    endingTitle: "Congratulations, My Love",
    endingLetter:
      "You made it all the way to the end of our special anniversary journey.\n\nEvery stop on this map holds a memory, but the best part of every trip is still getting to share it with you.\n\nThank you for the laughter, the softness, the patience, and the love that made this story ours.\n\nHappy Anniversary.\n\nWith all my love,"
  },
  map: {
    title: "Our Special Anniversary Journey",
    backgroundType: "gradient",
    backgroundValue:
      "radial-gradient(circle at 18% 20%, rgba(255,255,255,0.48), transparent 18%), linear-gradient(160deg, #f6c7d4 0%, #f4dfbf 38%, #d4eadf 70%, #a8cdcb 100%)",
    imageUrl: "",
    showGrid: false,
    nodes: [
      { id: "node-1", levelId: 1, label: "THL", x: 12, y: 80 },
      { id: "node-2", levelId: 2, label: "BKK", x: 24, y: 57 },
      { id: "node-3", levelId: 3, label: "KYA", x: 46, y: 78 },
      { id: "node-4", levelId: 4, label: "RYG", x: 71, y: 59 },
      { id: "node-5", levelId: 5, label: "KLW", x: 87, y: 34 },
      { id: "node-6", levelId: 6, label: "YGN", x: 61, y: 12 },
      { id: "node-7", levelId: 7, label: "NPT", x: 25, y: 21 }
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
      y: 79,
      imageUrl: ""
    },
    {
      id: "char-2",
      name: "Moss",
      role: "npc",
      shape: "square",
      color: "#3fb39e",
      size: 40,
      x: 90,
      y: 84,
      imageUrl: ""
    }
  ],
  levels: [
    {
      id: 1,
      title: "Thanlyin - Japanese Hotel",
      question: "What makes the first stop of an anniversary trip feel special?",
      options: ["Being there together", "Checking in quickly", "Finding the biggest room", "Taking separate photos"],
      answerIndex: 0,
      explanation: "The place matters, but sharing the moment together matters more.",
      arrivalMode: "Pink Leapmotor T03 into Thanlyin",
      travelMode: "Plane to Bangkok"
    },
    {
      id: 2,
      title: "Bangkok - City Hotel",
      question: "What keeps a busy city stop romantic?",
      options: ["Sharing the night together", "Rushing through the schedule", "Splitting up all evening", "Talking only about traffic"],
      answerIndex: 0,
      explanation: "Even in a busy city, the best part is still being together.",
      arrivalMode: "Arrive by plane",
      travelMode: "Nissan Kicks to Khao Yai"
    },
    {
      id: 3,
      title: "Khao Yai - Castle",
      question: "What turns a castle stay into a real memory?",
      options: ["A quiet moment together", "A packed timetable", "Racing to the next stop", "Ignoring the view"],
      answerIndex: 0,
      explanation: "A beautiful place becomes unforgettable when the two of you slow down and share it.",
      arrivalMode: "Arrive by Nissan Kicks",
      travelMode: "Nissan Kicks to Rayong"
    },
    {
      id: 4,
      title: "Rayong - Beach Resort",
      question: "What belongs in a perfect beach-resort day?",
      options: ["Slow time together", "Work emails", "A tight deadline", "A noisy argument"],
      answerIndex: 0,
      explanation: "The best beach days are the ones where you can slow down and just enjoy each other.",
      arrivalMode: "Arrive by Nissan Kicks",
      travelMode: "Black Toyota bZ4X to Kalaw"
    },
    {
      id: 5,
      title: "Kalaw - Small Townhouse",
      question: "What makes a small townhouse feel warm and full of love?",
      options: ["The person you share it with", "The size of the windows", "The number of rooms", "The street outside"],
      answerIndex: 0,
      explanation: "The feeling of home comes from who is beside you.",
      arrivalMode: "Arrive by black Toyota bZ4X",
      travelMode: "Train to Yangon"
    },
    {
      id: 6,
      title: "Yangon - Golden Pagoda",
      question: "What matters most at a beautiful stop like this?",
      options: ["Making the memory together", "Counting every step", "Leaving as fast as possible", "Checking the time the whole way"],
      answerIndex: 0,
      explanation: "The memory matters more than the rush around it.",
      arrivalMode: "Arrive by train",
      travelMode: "Same train to Naypyidaw"
    },
    {
      id: 7,
      title: "Naypyidaw - Government Building",
      question: "What is the best ending to this anniversary journey?",
      options: ["Choosing each other again", "Going separate ways", "Skipping the final moment", "Forgetting the memories"],
      answerIndex: 0,
      explanation: "The best ending is always choosing the love story again.",
      arrivalMode: "Arrive by the same train",
      travelMode: ""
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
  levelName: document.getElementById("levelName"),
  journeyMeta: document.getElementById("journeyMeta"),
  questionText: document.getElementById("questionText"),
  options: document.getElementById("options"),
  feedback: document.getElementById("feedback"),
  retryBtn: document.getElementById("retryBtn"),
  nextBtn: document.getElementById("nextBtn"),
  openLetterBtn: document.getElementById("openLetterBtn"),
  questionActions: document.getElementById("questionActions"),
  endingModal: document.getElementById("endingModal"),
  endingClose: document.getElementById("endingClose"),
  endingDismissBtn: document.getElementById("endingDismissBtn"),
  endingTitle: document.getElementById("endingTitle"),
  endingLetter: document.getElementById("endingLetter"),
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
let completionShown = false;
let endingRevealTimer = 0;

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

  el.openLetterBtn.addEventListener("click", () => {
    openEndingModal();
  });

  el.adminBtn.addEventListener("click", async () => {
    await openAdmin();
  });

  el.adminClose.addEventListener("click", () => {
    closeAdmin();
  });

  el.endingClose.addEventListener("click", () => {
    closeEndingModal();
  });

  el.endingDismissBtn.addEventListener("click", () => {
    closeEndingModal();
  });

  el.endingModal.addEventListener("click", (event) => {
    if (event.target === el.endingModal) {
      closeEndingModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (!el.endingModal.classList.contains("hidden")) {
      closeEndingModal();
      return;
    }

    if (!el.adminModal.classList.contains("hidden")) {
      closeAdmin();
    }
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
        arrivalMode: "",
        travelMode: "",
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
  completionShown = false;
  closeEndingModal();
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
  syncEndingExperience();
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

  const svg = buildRouteSvg(data.map.nodes);
  el.map.appendChild(svg);

  const firstLevel = data.levels[0];
  const firstNode = data.map.nodes[0];
  if (firstLevel?.arrivalMode && firstNode) {
    const introPosition = resolveIntroFigurePosition(firstNode);
    const introObject = buildTravelObject(
      firstLevel.arrivalMode,
      introPosition,
      0,
      "intro"
    );
    el.map.appendChild(introObject);
  }

  data.map.nodes.slice(0, -1).forEach((node, index) => {
    const nextNode = data.map.nodes[index + 1];
    const label = data.levels[index]?.travelMode;
    if (!nextNode || !label) return;

    const travelPosition = resolveTravelFigurePosition(node, nextNode, index);
    const travelObject = buildTravelObject(
      label,
      travelPosition,
      index + 1
    );
    el.map.appendChild(travelObject);
  });

  data.map.nodes.forEach((node, index) => {
    const resolvedIndex = resolveLevelIndex(node.levelId, index);
    const level = data.levels[resolvedIndex];
    if (!level) return;

    const stopPosition = resolveStopFigurePosition(node, resolvedIndex);
    appendMapLink(svg, node, stopPosition);
    el.map.appendChild(buildStopObject(level, stopPosition, resolvedIndex));
  });

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
    nodeEl.title = level?.title || `Level ${resolvedIndex + 1}`;

    const label = document.createElement("span");
    label.textContent = String(resolvedIndex + 1);
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

function buildRouteSvg(nodes) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 100 100");

  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
  gradient.setAttribute("id", "routeGradient");
  gradient.setAttribute("x1", "0%");
  gradient.setAttribute("y1", "100%");
  gradient.setAttribute("x2", "100%");
  gradient.setAttribute("y2", "0%");

  const start = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  start.setAttribute("offset", "0%");
  start.setAttribute("stop-color", "#f39aa7");

  const mid = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  mid.setAttribute("offset", "52%");
  mid.setAttribute("stop-color", "#f0b65c");

  const end = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  end.setAttribute("offset", "100%");
  end.setAttribute("stop-color", "#58b0a6");

  gradient.append(start, mid, end);
  defs.appendChild(gradient);
  svg.appendChild(defs);

  const routePath = buildRoutePath(nodes);

  const glow = document.createElementNS("http://www.w3.org/2000/svg", "path");
  glow.setAttribute("d", routePath);
  glow.setAttribute("class", "map-path-glow");
  glow.setAttribute("stroke", "url(#routeGradient)");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", routePath);
  path.setAttribute("class", "map-path");
  path.setAttribute("stroke", "url(#routeGradient)");

  const links = document.createElementNS("http://www.w3.org/2000/svg", "g");
  links.setAttribute("data-layer", "links");

  svg.append(glow, path, links);
  return svg;
}

function buildRoutePath(nodes) {
  if (!nodes.length) return "";
  if (nodes.length === 1) return `M ${nodes[0].x} ${nodes[0].y}`;
  if (nodes.length === 2) return `M ${nodes[0].x} ${nodes[0].y} L ${nodes[1].x} ${nodes[1].y}`;

  let path = `M ${nodes[0].x} ${nodes[0].y}`;

  for (let i = 0; i < nodes.length - 1; i += 1) {
    const p0 = nodes[i - 1] || nodes[i];
    const p1 = nodes[i];
    const p2 = nodes[i + 1];
    const p3 = nodes[i + 2] || p2;

    const cp1x = (p1.x + (p2.x - p0.x) / 6).toFixed(2);
    const cp1y = (p1.y + (p2.y - p0.y) / 6).toFixed(2);
    const cp2x = (p2.x - (p3.x - p1.x) / 6).toFixed(2);
    const cp2y = (p2.y - (p3.y - p1.y) / 6).toFixed(2);

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

function appendMapLink(svg, from, to) {
  const layer = svg.querySelector("[data-layer='links']");
  if (!layer) return;

  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("class", "map-link");
  line.setAttribute("x1", from.x);
  line.setAttribute("y1", from.y);
  line.setAttribute("x2", to.x);
  line.setAttribute("y2", to.y);
  layer.appendChild(line);
}

function renderCharacters() {
  const nodes = data.map.nodes;
  const currentLevelId = data.levels[state.currentLevelIndex]?.id;
  const currentIndex = Math.max(0, state.currentLevelIndex);
  const currentNode =
    nodes.find((node) => Number(node.levelId) === Number(currentLevelId)) ||
    nodes[currentIndex] ||
    nodes[0];
  const previousNode = nodes[Math.max(currentIndex - 1, 0)] || currentNode;

  const playerCharacters = data.characters.filter((character) => character.role === "player");
  const npcCharacters = data.characters.filter((character) => character.role !== "player");

  playerCharacters.forEach((character, index) => {
    const position = currentNode
      ? resolvePlayerCharacterPosition(currentNode, previousNode, index)
      : { x: character.x, y: character.y };

    el.map.appendChild(buildCharacter(character, position));
  });

  npcCharacters.forEach((character) => {
    el.map.appendChild(buildCharacter(character, { x: character.x, y: character.y }));
  });
}

function buildCharacter(character, position) {
  const wrapper = document.createElement("div");
  wrapper.className = `character ${character.shape} character--${character.role}`;
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

function routeTone(label) {
  const text = String(label || "").toLowerCase();
  if (text.includes("plane")) return "plane";
  if (text.includes("train")) return "train";
  if (text.includes("toyota") || text.includes("nissan") || text.includes("leapmotor")) return "car";
  return "default";
}

function stopTone(title) {
  const text = String(title || "").toLowerCase();
  if (text.includes("japanese hotel")) return "inn";
  if (text.includes("city hotel")) return "hotel";
  if (text.includes("castle")) return "castle";
  if (text.includes("beach")) return "resort";
  if (text.includes("townhouse")) return "townhouse";
  if (text.includes("pagoda")) return "pagoda";
  if (text.includes("government")) return "government";
  if (text.includes("hotel")) return "hotel";
  return "default";
}

function compactTravelLabel(label) {
  const text = String(label || "");
  const lower = text.toLowerCase();

  if (lower.includes("leapmotor")) return "Pink EV";
  if (lower.includes("nissan")) return "Kicks";
  if (lower.includes("toyota")) return "Toyota EV";
  if (lower.includes("plane")) return "Plane";
  if (lower.includes("train")) return "Train";
  return text;
}

function resolvePlayerCharacterPosition(currentNode, previousNode, index) {
  const incoming = normalizeVector(
    (currentNode?.x ?? 50) - (previousNode?.x ?? currentNode?.x ?? 50),
    (currentNode?.y ?? 50) - (previousNode?.y ?? currentNode?.y ?? 50)
  );
  const drift = index * 2;

  return {
    x: clamp((currentNode?.x ?? 50) - incoming.x * (4 + drift), 4, 96),
    y: clamp((currentNode?.y ?? 50) - incoming.y * (4 + drift) - 1.6, 6, 94)
  };
}

function resolveIntroFigurePosition(node) {
  const direction = normalizeVector(-1, 1);
  return {
    x: clamp(node.x + direction.x * 11, 8, 92),
    y: clamp(node.y + direction.y * 10, 8, 92)
  };
}

function resolveStopFigurePosition(node, index) {
  const directionSeed = getOutwardVector(node, index);
  const direction = normalizeVector(directionSeed.x, directionSeed.y);
  const distance = 14;

  return {
    x: clamp(node.x + direction.x * distance, 8, 92),
    y: clamp(node.y + direction.y * distance, 8, 92)
  };
}

function resolveTravelFigurePosition(node, nextNode, index) {
  const midX = (node.x + nextNode.x) / 2;
  const midY = (node.y + nextNode.y) / 2;
  const segment = normalizeVector(nextNode.x - node.x, nextNode.y - node.y);
  let normal = { x: -segment.y, y: segment.x };
  const fromCenter = { x: midX - 50, y: midY - 50 };

  if (normal.x * fromCenter.x + normal.y * fromCenter.y < 0) {
    normal = { x: -normal.x, y: -normal.y };
  }

  const distance = index % 2 === 0 ? 8.5 : 7.2;
  return {
    x: clamp(midX + normal.x * distance, 8, 92),
    y: clamp(midY + normal.y * distance, 8, 92)
  };
}

function getOutwardVector(point, index) {
  const fallback = [
    { x: -0.9, y: 0.45 },
    { x: -0.65, y: -0.55 },
    { x: 0.85, y: 0.35 },
    { x: 0.7, y: -0.65 }
  ][index % 4];

  const vector = {
    x: point.x <= 28 ? -1 : point.x >= 72 ? 1 : 0,
    y: point.y <= 28 ? -1 : point.y >= 72 ? 1 : 0
  };

  if (vector.x === 0 && vector.y === 0) {
    return fallback;
  }

  if (vector.x === 0) {
    return { x: fallback.x * 0.6, y: vector.y };
  }

  if (vector.y === 0) {
    return { x: vector.x, y: fallback.y * 0.6 };
  }

  return vector;
}

function normalizeVector(x, y) {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
}

function buildTravelObject(label, position, index = 0, variant = "") {
  const tone = routeTone(label);
  const figure = document.createElement("div");
  figure.className = `map-figure map-figure--travel map-figure--${tone}`;
  if (variant) figure.classList.add(`map-figure--${variant}`);
  figure.style.left = `${position.x}%`;
  figure.style.top = `${position.y}%`;
  figure.style.animationDelay = `${index * 0.4}s`;
  figure.title = label;

  const icon = document.createElement("span");
  icon.className = "map-figure__icon";
  icon.innerHTML = buildTravelSvg(tone);

  const labelEl = document.createElement("span");
  labelEl.className = "map-figure__label";
  labelEl.textContent = compactTravelLabel(label);
  labelEl.title = label;

  figure.append(icon, labelEl);
  return figure;
}

function buildStopObject(level, position, index) {
  const tone = stopTone(level.title);
  const figure = document.createElement("div");
  figure.className = `map-figure map-figure--stop map-figure--${tone}`;
  const isCurrent = index === state.currentLevelIndex && !state.finished;
  const isCompleted = Boolean(state.completed[String(level.id)]);
  if (isCurrent) figure.classList.add("is-current");
  if (isCompleted) figure.classList.add("is-completed");
  figure.style.left = `${position.x}%`;
  figure.style.top = `${position.y}%`;
  figure.style.animationDelay = `${index * 0.35}s`;
  figure.title = level.title;

  const icon = document.createElement("span");
  icon.className = "map-figure__icon";
  icon.innerHTML = buildStopSvg(tone);

  const [place, scene] = String(level.title || "").split(" - ");
  const title = document.createElement("span");
  title.className = "map-figure__title";
  title.textContent = place || level.title;

  const meta = document.createElement("span");
  meta.className = "map-figure__meta";
  meta.textContent = scene || "Stop";

  figure.append(icon, title, meta);
  return figure;
}

function buildTravelSvg(tone) {
  if (tone === "plane") {
    return `
      <svg viewBox="0 0 72 40" aria-hidden="true">
        <path d="M10 21h21l11-11h9l-7 11h16c3 0 3 5 0 5H44l7 11h-9L31 26H10c-3 0-3-5 0-5Z" fill="currentColor"></path>
      </svg>
    `;
  }

  if (tone === "train") {
    return `
      <svg viewBox="0 0 72 40" aria-hidden="true">
        <rect x="12" y="6" width="48" height="24" rx="8" fill="currentColor"></rect>
        <rect x="20" y="12" width="10" height="8" rx="2" fill="rgba(255,255,255,0.88)"></rect>
        <rect x="34" y="12" width="10" height="8" rx="2" fill="rgba(255,255,255,0.88)"></rect>
        <circle cx="24" cy="32" r="4" fill="currentColor"></circle>
        <circle cx="48" cy="32" r="4" fill="currentColor"></circle>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 72 40" aria-hidden="true">
      <rect x="16" y="12" width="36" height="14" rx="6" fill="currentColor"></rect>
      <rect x="43" y="8" width="14" height="10" rx="4" fill="currentColor"></rect>
      <circle cx="26" cy="30" r="4" fill="currentColor"></circle>
      <circle cx="48" cy="30" r="4" fill="currentColor"></circle>
    </svg>
  `;
}

function buildStopSvg(tone) {
  if (tone === "inn") {
    return `
      <svg viewBox="0 0 72 56" aria-hidden="true">
        <path d="M14 24h44v20H14Z" fill="currentColor"></path>
        <path d="M18 24l18-12 18 12" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path>
        <rect x="22" y="30" width="8" height="6" rx="1.5" fill="rgba(255,255,255,0.88)"></rect>
        <rect x="42" y="30" width="8" height="6" rx="1.5" fill="rgba(255,255,255,0.88)"></rect>
      </svg>
    `;
  }

  if (tone === "hotel") {
    return `
      <svg viewBox="0 0 72 56" aria-hidden="true">
        <rect x="18" y="10" width="36" height="36" rx="6" fill="currentColor"></rect>
        <rect x="24" y="16" width="8" height="8" rx="2" fill="rgba(255,255,255,0.88)"></rect>
        <rect x="40" y="16" width="8" height="8" rx="2" fill="rgba(255,255,255,0.88)"></rect>
        <rect x="24" y="28" width="8" height="8" rx="2" fill="rgba(255,255,255,0.88)"></rect>
        <rect x="40" y="28" width="8" height="8" rx="2" fill="rgba(255,255,255,0.88)"></rect>
      </svg>
    `;
  }

  if (tone === "castle") {
    return `
      <svg viewBox="0 0 72 56" aria-hidden="true">
        <path d="M16 18h10v-6l6 4 6-4v6h8v-6l6 4 6-4v6h8v24H16Z" fill="currentColor"></path>
        <rect x="32" y="28" width="8" height="14" rx="3" fill="rgba(255,255,255,0.88)"></rect>
      </svg>
    `;
  }

  if (tone === "resort") {
    return `
      <svg viewBox="0 0 72 56" aria-hidden="true">
        <circle cx="50" cy="14" r="7" fill="currentColor"></circle>
        <path d="M20 34c8-13 18-16 28-9-7 2-14 5-18 12Z" fill="currentColor"></path>
        <path d="M18 42h36" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"></path>
        <path d="M22 46c7 4 14 4 21 0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path>
      </svg>
    `;
  }

  if (tone === "townhouse") {
    return `
      <svg viewBox="0 0 72 56" aria-hidden="true">
        <path d="M18 24l18-12 18 12v20H18Z" fill="currentColor"></path>
        <rect x="32" y="30" width="8" height="14" rx="2" fill="rgba(255,255,255,0.88)"></rect>
      </svg>
    `;
  }

  if (tone === "pagoda") {
    return `
      <svg viewBox="0 0 72 56" aria-hidden="true">
        <path d="M36 8l3 6H33Z" fill="currentColor"></path>
        <path d="M24 18h24l-2 5H26Z" fill="currentColor"></path>
        <path d="M20 28h32l-3 6H23Z" fill="currentColor"></path>
        <path d="M16 38h40l-4 8H20Z" fill="currentColor"></path>
      </svg>
    `;
  }

  if (tone === "government") {
    return `
      <svg viewBox="0 0 72 56" aria-hidden="true">
        <path d="M16 20l20-10 20 10Z" fill="currentColor"></path>
        <rect x="18" y="22" width="6" height="18" rx="2" fill="currentColor"></rect>
        <rect x="30" y="22" width="6" height="18" rx="2" fill="currentColor"></rect>
        <rect x="42" y="22" width="6" height="18" rx="2" fill="currentColor"></rect>
        <rect x="54" y="22" width="6" height="18" rx="2" fill="currentColor"></rect>
        <rect x="14" y="40" width="44" height="6" rx="3" fill="currentColor"></rect>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 72 56" aria-hidden="true">
      <rect x="20" y="14" width="32" height="28" rx="8" fill="currentColor"></rect>
    </svg>
  `;
}

function renderQuestion() {
  const level = data.levels[state.currentLevelIndex];

  el.levelTag.textContent = `Level ${state.currentLevelIndex + 1}`;
  el.levelName.textContent = level?.title || "";
  el.journeyMeta.innerHTML = "";
  el.options.innerHTML = "";
  el.feedback.textContent = "";
  el.feedback.className = "feedback";
  el.retryBtn.classList.add("hidden");
  el.nextBtn.classList.add("hidden");
  el.openLetterBtn.classList.add("hidden");

  if (state.hearts <= 0) {
    el.levelName.textContent = "Journey paused";
    el.journeyMeta.innerHTML = "";
    el.questionText.textContent = "Out of hearts. Reset run to try again.";
    el.questionActions.classList.add("hidden");
    return;
  }

  if (state.finished) {
    el.levelTag.textContent = "Congratulations";
    el.levelName.textContent = "Journey complete";
    el.questionText.textContent =
      "You reached the final stop. Your heart envelope is ready with a special letter inside.";

    if (state.feedback) {
      el.feedback.textContent = state.feedback.text;
      el.feedback.classList.add(state.feedback.type === "correct" ? "success" : "fail");
    }

    el.openLetterBtn.classList.remove("hidden");
    el.questionActions.classList.remove("hidden");
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
  el.openLetterBtn.classList.add("hidden");
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

function syncEndingExperience() {
  renderEndingLetter();

  if (!state?.finished) {
    completionShown = false;
    closeEndingModal();
    return;
  }

  if (!completionShown) {
    openEndingModal();
    completionShown = true;
  }
}

function renderEndingLetter() {
  if (!data) return;

  el.endingTitle.textContent = data.settings.endingTitle;
  el.endingLetter.textContent = data.settings.endingLetter;
}

function openEndingModal() {
  if (!state?.finished) return;

  renderEndingLetter();
  window.clearTimeout(endingRevealTimer);
  el.endingModal.classList.remove("hidden");
  el.endingModal.setAttribute("aria-hidden", "false");
  el.endingModal.classList.remove("is-open");
  void el.endingModal.offsetWidth;
  endingRevealTimer = window.setTimeout(() => {
    el.endingModal.classList.add("is-open");
  }, 60);
}

function closeEndingModal() {
  window.clearTimeout(endingRevealTimer);
  el.endingModal.classList.add("hidden");
  el.endingModal.classList.remove("is-open");
  el.endingModal.setAttribute("aria-hidden", "true");
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
    if (response.correct && state.finished) {
      completionShown = true;
      openEndingModal();
    }
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

function adminLead(title, text) {
  return `
    <section class="admin-lead">
      <p class="eyebrow">Studio View</p>
      <h3>${escapeHtml(title)}</h3>
      <p class="hint">${escapeHtml(text)}</p>
    </section>
  `;
}

function renderAdminMap() {
  el.adminMap.innerHTML = `
    ${adminLead("Map layout", "Move the path, swap backgrounds, and keep the route easy to read on mobile.")}
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
    ${adminLead("Character styling", "Update the player and NPC look without losing map balance.")}
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
    ${adminLead("Level questions", "Questions stay separate from the animated journey objects on the map. Edit the map objects here too.")}
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
          <div class="field-grid">
            <label>Arrival object<input data-field="arrivalMode" class="input" value="${escapeHtml(
              level.arrivalMode || ""
            )}" /></label>
            <label>Travel object<input data-field="travelMode" class="input" value="${escapeHtml(
              level.travelMode || ""
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
    ${adminLead("Game finish", "Tune the heart rules and write the special letter that appears after the last level.")}
    <div class="field-grid">
      <label>Start hearts<input id="draft-start-hearts" class="input" value="${escapeHtml(
        draftData.settings.startHearts
      )}" /></label>
      <label>Max hearts<input id="draft-max-hearts" class="input" value="${escapeHtml(
        draftData.settings.maxHearts
      )}" /></label>
    </div>
    <div class="letter-editor">
      <label>Letter heading<input id="draft-ending-title" class="input" value="${escapeHtml(
        draftData.settings.endingTitle
      )}" /></label>
      <label>Special letter<textarea id="draft-ending-letter">${escapeHtml(
        draftData.settings.endingLetter
      )}</textarea></label>
    </div>
    <p class="hint">Hearts are capped at 5 by backend rule.</p>
  `;
}

function renderAdminAnalytics() {
  if (!analyticsSummary) {
    el.adminAnalytics.innerHTML = `
      ${adminLead("Live analytics", "See which levels are causing trouble and reload metrics anytime.")}
      <div class="analytics-empty">
        <div>
          <strong>Analytics not loaded yet</strong>
          <p class="hint">Press refresh to pull the latest stats from the server.</p>
        </div>
        <button class="btn ghost" data-action="refresh-analytics" type="button">Refresh</button>
      </div>
    `;
    return;
  }

  el.adminAnalytics.innerHTML = `
    ${adminLead("Live analytics", "Review overall activity and spot the levels people miss most often.")}
    <div class="analytics-grid analytics-grid--summary">
      <div class="metric-card"><p class="eyebrow">Users</p><h3>${analyticsSummary.totalUsers}</h3></div>
      <div class="metric-card"><p class="eyebrow">Active Today</p><h3>${analyticsSummary.activeToday}</h3></div>
      <div class="metric-card"><p class="eyebrow">Attempts</p><h3>${analyticsSummary.totalAttempts}</h3></div>
      <div class="metric-card"><p class="eyebrow">Accuracy</p><h3>${analyticsSummary.accuracyPercent}%</h3></div>
      <div class="metric-card"><p class="eyebrow">Completed Runs</p><h3>${analyticsSummary.completedRuns}</h3></div>
      <div class="metric-card"><p class="eyebrow">Wrong Answers</p><h3>${analyticsSummary.wrongAnswers}</h3></div>
    </div>
    <div class="analytics-panel">
      <header class="section-head">
        <strong>Top levels by wrong answers</strong>
        <div class="row-actions">
          <button class="btn ghost" data-action="refresh-analytics" type="button">Refresh</button>
        </div>
      </header>
      <div class="analytics-list">
        ${analyticsSummary.topLevels
          .map(
            (item) => `
              <div class="analytics-row">
                <strong class="analytics-level">Level ${item.levelId}</strong>
                <span class="analytics-pill analytics-pill--warn">Wrong ${item.wrong}</span>
                <span class="analytics-pill analytics-pill--good">Correct ${item.correct}</span>
              </div>
            `
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
      arrivalMode: getValue("arrivalMode") || "",
      travelMode: getValue("travelMode") || "",
      question: getValue("question") || "New question",
      options: options.length ? options : ["Option A", "Option B"],
      answerIndex: clamp(safeNumber(getValue("answerIndex"), 1) - 1, 0, Math.max(options.length - 1, 0)),
      explanation: getValue("explanation") || ""
    };
  });

  const startHearts = document.getElementById("draft-start-hearts");
  const maxHearts = document.getElementById("draft-max-hearts");
  const endingTitle = document.getElementById("draft-ending-title");
  const endingLetter = document.getElementById("draft-ending-letter");

  if (startHearts) {
    draftData.settings.startHearts = safeNumber(startHearts.value, 3);
  }

  if (maxHearts) {
    draftData.settings.maxHearts = safeNumber(maxHearts.value, 5);
  }

  if (endingTitle) {
    draftData.settings.endingTitle = endingTitle.value.trim() || DEFAULT_DATA.settings.endingTitle;
  }

  if (endingLetter) {
    draftData.settings.endingLetter =
      endingLetter.value.trim() || DEFAULT_DATA.settings.endingLetter;
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
  output.settings.endingTitle = safeText(
    output.settings.endingTitle,
    DEFAULT_DATA.settings.endingTitle
  );
  output.settings.endingLetter = safeText(
    output.settings.endingLetter,
    DEFAULT_DATA.settings.endingLetter
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
    level.arrivalMode = level.arrivalMode || "";
    level.travelMode = level.travelMode || "";
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

function safeText(value, fallback) {
  const text = String(value ?? "").trim();
  return text || fallback;
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
