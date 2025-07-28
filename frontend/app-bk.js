

// ==== Config ====
const COGNITO_DOMAIN = "https://ap-southeast-2v3udzxxtw.auth.ap-southeast-2.amazoncognito.com"; // e.g. myapp.auth.ap-southeast-1.amazoncognito.com
const CLIENT_ID = "7jjhsd6m1q3um03106k9l3b15k";
const REDIRECT_URI = "http://localhost/frontend/index.html"; // Or your actual deployed URL
//const API_BASE = "http://localhost:3000"; // Backend API endpoint
const SCOPE = "openid email profile";

// --------------- PKCE HELPERS -----------
function base64URLEncode(str) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function sha256(buffer) {
  return await crypto.subtle.digest("SHA-256", new TextEncoder().encode(buffer));
}

// --------------- LOGIN FLOW -------------
async function startLogin() {
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
    `&scope=${SCOPE}` ;

  window.location.href = url;
}

// --------------- CALLBACK HANDLER -------
async function handleRedirect() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const verifier = localStorage.getItem("pkce_verifier");
  if (code && verifier) {
    document.getElementById("msg").innerText = "Exchanging token...";
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
        document.getElementById("msg").innerText = "Login successful!";
        // Clean up URL
       // window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        document.getElementById("msg").innerText = "Token exchange failed.";
      }
    } catch (e) {
      document.getElementById("msg").innerText = "Error exchanging token.";
    }
  }
}

// --------------- INIT -------------------
window.onload = () => {
  document.getElementById("login-btn").onclick = startLogin;
  handleRedirect();
};
