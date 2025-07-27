// frontend/config.js
const hostname = window.location.hostname;

if (hostname === "localhost") {
  window._env_ = {
    COGNITO_DOMAIN: "https://ap-southeast-2v3udzxxtw.auth.ap-southeast-2.amazoncognito.com",
    CLIENT_ID: "7jjhsd6m1q3um03106k9l3b15k",
    REDIRECT_URI: "http://localhost/frontend/index.html"

  };
} else {
  window._env_ = {
    COGNITO_DOMAIN: "https://ap-southeast-2v3udzxxtw.auth.ap-southeast-2.amazoncognito.com",
    CLIENT_ID: "7jjhsd6m1q3um03106k9l3b15k",
    REDIRECT_URI: "http://3.106.127.61/frontend/index.html"
  };
}
