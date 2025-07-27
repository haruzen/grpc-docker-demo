// ==== Config ====
const COGNITO_DOMAIN =  window._env_.COGNITO_DOMAIN ;
const CLIENT_ID = window._env_.CLIENT_ID ;
const REDIRECT_URI = window._env_.REDIRECT_URI ;
const SCOPE = "openid email profile";
const API_BASE = ""; // Same-origin API

// ---- DOM Caching ----
const tasksBody = document.getElementById("tasks-body");
const userRoleLabel = document.getElementById("user-role");
const tasksTitle = document.getElementById("tasks-title");
const msgEl = document.getElementById("msg");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const addTaskForm = document.getElementById("add-task-form");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskTitleInput = document.getElementById("taskTitle");

// PKCE Helpers
function base64URLEncode(str) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function sha256(buffer) {
  if (!window.crypto || !window.crypto.subtle) {
    console.error("Crypto.subtle is not available. Use HTTPS or localhost.");
    throw new Error("SubtleCrypto not available. Must run in secure context (HTTPS).");
  }

  const encoded = new TextEncoder().encode(buffer);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", encoded);
  return hashBuffer;
}


// JWT Helper
function parseJwt(token) {
  if (!token) return {};
  try {
    let base64 = token.split('.')[1];
    base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    if (padding) base64 += '='.repeat(4 - padding);
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    logout();
    return {};
  }
}

// ---- LOGIN FLOW ----
async function login() {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  const verifier = base64URLEncode(array);
  const hash = await sha256(verifier);
  const challenge = base64URLEncode(hash);
  localStorage.setItem("pkce_verifier", verifier);

  const url = `${COGNITO_DOMAIN}/oauth2/authorize?response_type=code` +
    `&client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&code_challenge=${challenge}` +
    `&code_challenge_method=S256` +
    `&scope=${SCOPE}`;
  window.location.href = url;
}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("id_token");
  localStorage.removeItem("pkce_verifier");
  setMsg("");
  renderTasks([]);
  updateUI();
  const LOGOUT_REDIRECT_URI = REDIRECT_URI;
  window.location.href = `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}&logout_uri=${encodeURIComponent(LOGOUT_REDIRECT_URI)}`;
}

// ---- CALLBACK HANDLER ----
async function handleRedirect() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const verifier = localStorage.getItem("pkce_verifier");
  if (code && verifier) {
    setMsg("Exchanging token...");
    try {
      const res = await fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, verifier })
      });
      const tokens = await res.json();
      if (tokens.access_token) {
        localStorage.setItem("access_token", tokens.access_token);
        localStorage.setItem("id_token", tokens.id_token);
        setMsg("Login successful!");
        window.history.replaceState({}, document.title, window.location.pathname);
        updateUI();
        fetchTasks();
      } else {
        setMsg("Token exchange failed.");
      }
    } catch (e) {
      setMsg("Error exchanging token.");
    }
  }
}

// ---- TASK API ----
function getAccessToken() {
  return localStorage.getItem("access_token");
}
function getIdToken() {
  return localStorage.getItem("id_token");
}

function getUserGroups() {
  const idToken = getIdToken();
  if (!idToken) return [];
  const payload = parseJwt(idToken);
  return payload["cognito:groups"] || [];
}
function isAdmin() {
  return getUserGroups().includes("Admins");
}

async function fetchTasks() {
  const token = getAccessToken();
  if (!token) {
    renderTasks([]);
    return;
  }
  setMsg("Loading tasks...");
  const endpoint = isAdmin() ? "/api/admin/tasks" : "/api/tasks";
  try {
    const res = await fetch(endpoint, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) {
      setMsg("Failed to fetch tasks.");
      renderTasks([]);
      return;
    }
    const data = await res.json();
    renderTasks(data);
    setMsg("");
  } catch (e) {
    setMsg("Network error fetching tasks.");
    renderTasks([]);
  }
}

async function addTask() {
  const title = taskTitleInput.value.trim();
  if (!title) {
    alert("Please enter a task title.");
    return;
  }
  const token = getAccessToken();
  if (!token) {
    alert("Please login first.");
    return;
  }
  addTaskBtn.disabled = true;
  try {
    const res = await fetch(`/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ title })
    });
    if (res.ok) {
      taskTitleInput.value = "";
      fetchTasks();
    } else {
      const err = await res.json();
      alert("Error: " + (err.error || "Failed to add task"));
    }
  } catch (e) {
    alert("Network error adding task.");
  }
  addTaskBtn.disabled = false;
}

// ---- UI RENDERING ----
function setMsg(message) {
  if (msgEl) msgEl.innerText = message || "";
}

function renderTasks(tasks) {
  if (!tasksBody) return;
  if (!tasks.length) {
    tasksBody.innerHTML = `<tr><td colspan="4"><i>No tasks yet.</i></td></tr>`;
    return;
  }
  tasksBody.innerHTML = tasks.map(task =>
    `<tr>
      <td>${task._id || ''}</td>
      <td>${task.title || ''}</td>
      <td>${task.status || ''}</td>
      <td>${task.userId || ''}</td>
    </tr>`
  ).join("");
}

function updateUI() {
  const token = getAccessToken();
  if (loginBtn) loginBtn.style.display = token ? "none" : "";
  if (logoutBtn) logoutBtn.style.display = token ? "" : "none";
  if (addTaskForm) addTaskForm.style.display = token ? "" : "none";
  if (userRoleLabel) {
    userRoleLabel.style.display = token ? "" : "none";
    userRoleLabel.textContent = isAdmin() ? "[Admin]" : "[User]";
  }
  if (tasksTitle) {
    tasksTitle.textContent = isAdmin() ? "All Users’ Tasks (Admin)" : "Your Tasks";
  }
  if (token) setMsg("Welcome! Loading your tasks...");
  fetchTasks();
}

// ---- INIT ----
window.onload = () => {
  if (loginBtn) loginBtn.onclick = login;
  if (logoutBtn) logoutBtn.onclick = logout;
  if (addTaskForm) addTaskForm.onsubmit = function(e) { e.preventDefault(); addTask(); };
  handleRedirect();
  updateUI();
};
