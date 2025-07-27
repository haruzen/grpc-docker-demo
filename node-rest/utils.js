// Create Admin Check Helper
function isAdmin(req) {
  return (
    req.auth &&
    Array.isArray(req.auth['cognito:groups']) &&
    req.auth['cognito:groups'].includes('Admins')
  );
}
module.exports = { isAdmin };
