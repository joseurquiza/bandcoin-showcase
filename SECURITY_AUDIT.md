# Security Audit Report - BandCoin Showcase

**Audit Date:** January 30, 2026  
**Status:** ⚠️ CRITICAL ISSUES FOUND - DO NOT OPEN SOURCE WITHOUT FIXES

---

## 🚨 CRITICAL SECURITY ISSUES (Must Fix Before Open Source)

### 1. **Hardcoded JWT Secret with Default Value**
**Severity:** 🔴 CRITICAL  
**Location:** `/app/vault/auth-actions.ts`, `/app/admin/withdrawal-actions.ts`

```typescript
const JWT_SECRET = new TextEncoder().encode(process.env.VAULT_JWT_SECRET || "vault-secret-key-change-in-production")
// Also:
const JWT_SECRET = process.env.VAULT_JWT_SECRET || "your-secret-key"
```

**Issue:** Default fallback secrets are visible in code. If `VAULT_JWT_SECRET` is not set, the app uses a hardcoded secret that anyone can see in the repository.

**Impact:** Attackers can forge authentication tokens and impersonate any user including admins.

**Fix Required:**
```typescript
// Remove fallback - fail fast if not configured
const JWT_SECRET = process.env.VAULT_JWT_SECRET
if (!JWT_SECRET) {
  throw new Error("VAULT_JWT_SECRET must be configured")
}
const encodedSecret = new TextEncoder().encode(JWT_SECRET)
```

---

### 2. **Missing Environment Variable Validation**
**Severity:** 🔴 CRITICAL  
**Locations:** Multiple files use `process.env.X!` with non-null assertion

**Issue:** Using TypeScript's non-null assertion operator (`!`) assumes environment variables exist without validation. App will crash or behave unexpectedly if variables are missing.

**Files Affected:**
- `/lib/stripe.ts` - `STRIPE_SECRET_KEY!`
- `/lib/printful-client.ts` - `PRINTFUL_API_KEY!`
- `/app/vibeportal/db-actions.ts` - `DATABASE_URL!`
- Many more (30+ instances)

**Fix Required:** Create an environment validation module:

```typescript
// lib/env.ts
const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  VAULT_JWT_SECRET: process.env.VAULT_JWT_SECRET,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  // ... add all required vars
}

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

export const env = requiredEnvVars as Record<string, string>
```

---

### 3. **Weak Admin Authentication**
**Severity:** 🔴 CRITICAL  
**Location:** `/app/api/orders/route.ts`

```typescript
const adminKey = process.env.ADMIN_API_KEY
if (!authHeader || authHeader !== `Bearer ${adminKey}`) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
```

**Issues:**
- No rate limiting on admin endpoints
- Simple bearer token instead of proper session/JWT authentication
- No logging of admin actions
- No IP allowlisting

**Fix Required:**
- Reuse existing JWT-based admin authentication from vault system
- Add rate limiting
- Add audit logging for all admin actions

---

## ⚠️ HIGH SEVERITY ISSUES

### 4. **SQL Injection Risk - Template Literal Usage**
**Severity:** 🟠 HIGH  
**Locations:** All database query files (30+ files)

**Issue:** While Neon's tagged templates provide protection, the code uses string interpolation with `${}` which could be vulnerable if inputs aren't properly sanitized.

**Example:**
```typescript
await sql`SELECT * FROM vault_users WHERE email = ${email}`
```

**Current Status:** ✅ Appears safe (Neon handles parameterization)  
**Recommendation:** Add input validation layer as defense-in-depth

---

### 5. **Missing Rate Limiting**
**Severity:** 🟠 HIGH  
**Locations:** All API routes

**Issue:** No rate limiting on:
- Authentication endpoints (brute force vulnerability)
- AI generation endpoints (abuse potential)
- Withdrawal requests (spam potential)
- Message sending (spam potential)

**Fix Required:**
```typescript
// Add middleware for rate limiting
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
})
```

---

### 6. **Stripe Webhook Secret Validation**
**Severity:** 🟠 HIGH  
**Location:** `/app/api/webhooks/stripe/route.ts`

```typescript
event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || "")
```

**Issue:** Empty string fallback allows bypass if env var missing.

**Fix Required:**
```typescript
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
if (!webhookSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET not configured")
}
event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
```

---

### 7. **Insecure Session Configuration in Development**
**Severity:** 🟠 HIGH  
**Location:** Multiple auth files

```typescript
cookieStore.set("vault_session", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",  // ⚠️ Not secure in dev
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7,
})
```

**Issue:** Cookies not secure in development, making local testing vulnerable to interception.

**Fix Required:**
```typescript
secure: process.env.NODE_ENV === "production" || process.env.FORCE_SECURE_COOKIES === "true"
```

---

## ⚡ MEDIUM SEVERITY ISSUES

### 8. **Exposed Debug Logs**
**Severity:** 🟡 MEDIUM  
**Locations:** Multiple files with `console.log` statements

**Issue:** Debug logs expose sensitive data:
```typescript
console.log("[v0] User found with stellar_address:", user.stellar_address)
console.log("[v0] Current user:", user ? `ID: ${user.id}, Email: ${user.email}` : "null")
```

**Fix Required:** Use proper logging library with levels:
```typescript
// Replace all console.log with proper logger
import { logger } from '@/lib/logger'
logger.debug('User found', { userId: user.id }) // Only in dev
logger.info('User authenticated') // No sensitive data
```

---

### 9. **Missing Input Validation**
**Severity:** 🟡 MEDIUM  
**Locations:** Multiple API routes

**Issue:** Basic validation exists but inconsistent across endpoints.

**Current Good Example:**
```typescript
function sanitizeInput(input: string): string {
  return input.trim().slice(0, 5000)
}
```

**Recommendation:** Use Zod schemas consistently:
```typescript
import { z } from 'zod'

const orderSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  // ... etc
})
```

---

### 10. **No CSRF Protection**
**Severity:** 🟡 MEDIUM  
**Locations:** All POST endpoints

**Issue:** Server actions rely on Next.js built-in protection, but API routes don't have explicit CSRF tokens.

**Current Status:** Partially mitigated by SameSite cookies  
**Recommendation:** Add explicit CSRF tokens for sensitive operations

---

### 11. **Password Requirements Too Weak**
**Severity:** 🟡 MEDIUM  
**Location:** `/app/vault/signup/page.tsx`

```typescript
if (password.length < 8) {
  setError("Password must be at least 8 characters")
  return
}
```

**Issue:** Only checks length, no complexity requirements.

**Fix Required:**
```typescript
const passwordSchema = z.string()
  .min(10)
  .regex(/[A-Z]/, "Must contain uppercase")
  .regex(/[a-z]/, "Must contain lowercase")
  .regex(/[0-9]/, "Must contain number")
  .regex(/[^A-Za-z0-9]/, "Must contain special character")
```

---

### 12. **Content Security Policy Could Be Stricter**
**Severity:** 🟡 MEDIUM  
**Location:** `/proxy.ts`

```typescript
"Content-Security-Policy",
"default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; ..."
```

**Issue:** `unsafe-eval` and `unsafe-inline` reduce CSP effectiveness.

**Recommendation:** Use nonces for inline scripts/styles, remove unsafe-eval if possible.

---

## ✅ GOOD SECURITY PRACTICES FOUND

1. **bcrypt for Password Hashing** - Using proper rounds (default 10)
2. **HttpOnly Cookies** - Session tokens not accessible to JavaScript
3. **Prepared Statements** - Using Neon's parameterized queries
4. **Server-Only Imports** - Stripe key in server-only file
5. **Security Headers** - X-Frame-Options, X-Content-Type-Options set
6. **Environment Files in .gitignore** - `.env*` properly excluded

---

## 📋 PRE-OPEN SOURCE CHECKLIST

Before making this repository public, complete the following:

### Required (Must Complete)
- [ ] **Remove all hardcoded secrets and fallbacks**
- [ ] **Add environment variable validation on startup**
- [ ] **Fix admin authentication weaknesses**
- [ ] **Add rate limiting to all endpoints**
- [ ] **Fix Stripe webhook secret validation**
- [ ] **Remove all sensitive console.log statements**
- [ ] **Create `.env.example` file with all required variables**
- [ ] **Add SECURITY.md with vulnerability reporting instructions**
- [ ] **Strengthen password requirements**
- [ ] **Add admin action audit logging**

### Recommended
- [ ] Add Zod validation to all API endpoints
- [ ] Implement CSRF tokens for sensitive operations
- [ ] Add IP-based rate limiting for auth endpoints
- [ ] Set up security monitoring/alerting
- [ ] Add input sanitization library
- [ ] Implement better error handling (don't leak stack traces)
- [ ] Add automated security scanning in CI/CD
- [ ] Conduct penetration testing
- [ ] Add Content Security Policy nonces
- [ ] Review and minimize API surface area

### Documentation
- [ ] Document all required environment variables
- [ ] Create setup guide with security best practices
- [ ] Add contribution guidelines with security requirements
- [ ] Document authentication flows
- [ ] Add API documentation with auth requirements

---

## 🔐 RECOMMENDED ENV VARIABLES TO DOCUMENT

Create a `.env.example` file:

```bash
# Database (Required)
DATABASE_URL="postgresql://..."

# Authentication (Required)
VAULT_JWT_SECRET="generate-a-strong-random-secret-here"

# Stripe (Required for payments)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# API Keys (Optional - for specific features)
GEMINI_API_KEY=""
V0_API_KEY=""
PRINTFUL_API_KEY=""
ADMIN_API_KEY=""

# Stellar (Optional - for blockchain features)
NEXT_PUBLIC_VAULT_CONTRACT_ID=""

# Node Environment
NODE_ENV="production"
```

---

## 🚨 IMMEDIATE ACTION ITEMS

1. **DO NOT** publish this repository in its current state
2. Fix all CRITICAL issues immediately
3. Create `.env.example` file
4. Remove any committed `.env` files from git history if they exist
5. Rotate all secrets that may have been exposed
6. Add pre-commit hooks to prevent secret commits

---

## 📞 SECURITY CONTACT

Once public, add to `SECURITY.md`:
- Security email: security@yourdomain.com
- Vulnerability disclosure policy
- Bug bounty information (if applicable)

---

**End of Security Audit Report**
