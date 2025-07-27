
# 🔐 Summary Flow Diagram

```
User clicks Login
    │
    ▼
Frontend → Redirects to Cognito Hosted UI (with PKCE code_challenge)
    │
    ▼
User logs in on Cognito
    │
    ▼
Cognito redirects back to frontend (with ?code=...)
    │
    ▼
Frontend → POST /api/auth/token { code, verifier }
    │
    ▼
Node.js backend (Express):
    └→ Calls Cognito /oauth2/token
         └→ Returns tokens
    │
    ▼
Frontend receives & stores tokens
    │
    ▼
Frontend makes API requests with Authorization: Bearer <access_token>
    │
    ▼
Backend validates token, processes API request
```

---

## 🗝️ How JWT Verification with JWK Works

### 1. What is a JWK?

- **JWK** stands for **JSON Web Key**.
- It’s a JSON data structure representing a cryptographic key (public or private), typically used to verify JWTs.
- A **JWKS** is a JSON Web Key Set—a JSON object containing an array (`keys`) of JWKs.

---

### 2. Sample JWK Structure

Here’s a sample JWKS returned by AWS Cognito at  
`https://cognito-idp.<region>.amazonaws.com/<userPoolId>/.well-known/jwks.json`:

```json
{
  "keys": [
    {
      "alg": "RS256",
      "e": "AQAB",
      "kid": "abcdef1234567890",
      "kty": "RSA",
      "n": "0vx7...wHFG",
      "use": "sig"
    }
  ]
}
```

---

### 3. How JWT Verification with JWK Works

**Step by Step:**

#### JWT Header

The JWT contains a header section, which includes the `kid` (Key ID) and algorithm.

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "abcdef1234567890"
}
```

#### Token Received

- Backend receives a JWT (usually in `Authorization: Bearer ...`).

#### Fetch JWK Set

- Backend fetches the JWKS from the issuer endpoint (caching is recommended).

#### Find Key

- From the `keys` array, find the JWK where `kid` matches the JWT header.

#### Reconstruct Public Key

- Use `n` (modulus) and `e` (exponent) to reconstruct the RSA public key.

#### Verify Signature

- Use the reconstructed public key and algorithm (e.g., RS256) to verify the JWT’s signature.

#### Check Claims

- Also verify `iss` (issuer), `aud` (audience), `exp` (expiry), etc.

---

### 4. Simple Example

#### JWKS Example

```json
{
  "keys": [
    {
      "alg": "RS256",
      "e": "AQAB",
      "kid": "KEY_ID_1",
      "kty": "RSA",
      "n": "1ZR5kNY5b8GrwR5TS4xiQ5rK8s5J_pUV...",
      "use": "sig"
    }
  ]
}
```

#### JWT Header Example

```json
{
  "alg": "RS256",
  "typ": "JWT",
  "kid": "KEY_ID_1"
}
```

#### Validation Process

1. Parse JWT header, see `kid = "KEY_ID_1"`.
2. In the JWKS, find a key with `"kid": "KEY_ID_1"`.
3. Use `n` and `e` to reconstruct the RSA public key.
4. Use this public key to verify the JWT’s RS256 signature.

---

### 5. Visual Flow

```
JWT Header (kid: KEY_ID_1)
       │
       ▼
Fetch JWKS (contains keys array)
       │
       ▼
Find JWK with kid == KEY_ID_1
       │
       ▼
Reconstruct RSA Public Key (using n & e)
       │
       ▼
Verify JWT signature & claims
```

### 6. Common Cognito-JWT pain point

```
AWS Cognito access_token has client_id, not aud.

Remove audience from your JWT middleware config for access token validation.

Do NOT use id_token for API authentication.

If you still want to enforce client_id, add your own check after middleware.

This is a common Cognito-JWT pain point—your logic is correct, just the AWS token structure differs from the JWT "norm"!
```
