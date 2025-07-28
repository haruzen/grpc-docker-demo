//Backend: Add /api/auth/token Endpoint
//require('dotenv').config();
const fs = require('fs');
let envFile = ".env.local";
if (process.env.NODE_ENV === "production") {
  envFile = ".env.production";
}
if (fs.existsSync(envFile)) {
  require("dotenv").config({ path: envFile });
}
const express = require('express');
const router = express.Router();

const COGNITO_DOMAIN = process.env.COGNITO_DOMAIN;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;
const REDIRECT_URI = process.env.COGNITO_REDIRECT_URI;

router.post('/token', async (req, res) => {
  const { code, verifier } = req.body;
  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('client_id', CLIENT_ID);
  params.append('code', code);
  params.append('redirect_uri', REDIRECT_URI);
  params.append('code_verifier', verifier);

  const basicAuth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${basicAuth}`
    },
    body: params
  });
  const data = await response.json();
  if (!response.ok) return res.status(400).json(data);
  res.json(data);
});

// Middleware auth.js
const { expressjwt: jwt } = require("express-jwt");
const jwksRsa = require("jwks-rsa");

const region = process.env.REGION
const userPoolId = process.env.USER_POOL_ID;
//const audience = process.env.COGNITO_CLIENT_ID ;



const jwtCheck = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`,
  }),
  //audience, Cognito’s access_token does NOT have an aud claim, so express-jwt fails.
  issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
  algorithms: ["RS256"],
});

module.exports = {
  router,
  jwtCheck
};
