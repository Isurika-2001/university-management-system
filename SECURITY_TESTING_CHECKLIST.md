# Security Testing Checklist - Pre-Production

## ⚠️ IMPORTANT: Development vs Production

**Current Setup:**
- ❌ `npm run dev` (server) - Development mode with nodemon (auto-restart)
- ❌ `npm start` (client) - Development server (not optimized, includes dev tools)

**For Production:**
- ✅ Server: `npm start` (uses `node index.js` - production ready)
- ✅ Client: `npm run build` (creates optimized production build)

---

## 🔒 Security Testing Checklist

### 1. Authentication & Authorization Tests

#### Login Security
- [ ] **Test invalid credentials** - Should return generic error (not "user not found" vs "wrong password")
- [ ] **Test SQL/NoSQL injection in login** - Try: `email: {"$ne": null}`, `password: {"$ne": null}`
- [ ] **Test rate limiting** - Try 15+ failed login attempts, should be blocked
- [ ] **Test password length limits** - Try password > 128 chars, should be rejected
- [ ] **Test email format validation** - Try invalid emails, should be rejected
- [ ] **Test disabled user login** - Disable a user, try to login, should be blocked
- [ ] **Test JWT token expiration** - Wait 24 hours, token should be invalid
- [ ] **Test JWT token tampering** - Modify token, should be rejected

#### Session Management
- [ ] **Test cookie security** - Check cookies are HttpOnly, Secure (in production), SameSite
- [ ] **Test logout** - Logout should clear cookie
- [ ] **Test concurrent sessions** - Login from multiple devices, all should work
- [ ] **Test session timeout** - After 24 hours, should require re-login

#### Authorization
- [ ] **Test unauthorized access** - Try accessing protected routes without login
- [ ] **Test permission checks** - User without 'create' permission can't create resources
- [ ] **Test role-based access** - Different user types have correct permissions

---

### 2. Input Validation & Injection Tests

#### RegExp Injection
- [ ] **Test malicious search patterns**:
  ```
  Search: ".*"
  Search: "(a+)+$"
  Search: "([a-zA-Z]+)*"
  ```
  Should not crash server or cause ReDoS

#### XSS (Cross-Site Scripting)
- [ ] **Test script injection in text fields**:
  ```html
  <script>alert('XSS')</script>
  <img src=x onerror=alert('XSS')>
  ```
  Should be sanitized or escaped

#### NoSQL Injection
- [ ] **Test MongoDB injection**:
  ```json
  {"email": {"$ne": null}, "password": {"$ne": null}}
  {"$where": "this.password == this.email"}
  ```
  Should be rejected

#### SQL Injection (if using SQL)
- [ ] **Test SQL injection**:
  ```
  ' OR '1'='1
  '; DROP TABLE users; --
  ```
  Should be rejected (MongoDB is safe, but test if you add SQL later)

#### Command Injection
- [ ] **Test command injection in file uploads**:
  ```
  filename: "; rm -rf /"
  ```
  Should be sanitized

---

### 3. API Security Tests

#### Rate Limiting
- [ ] **Test API rate limits** - Make 100+ rapid requests, should be throttled
- [ ] **Test auth endpoint rate limit** - 10 attempts per 15 minutes
- [ ] **Test general endpoint rate limit** - 100 requests per 15 minutes

#### CORS
- [ ] **Test CORS from unauthorized origin** - Should be blocked
- [ ] **Test CORS from authorized origin** - Should work
- [ ] **Test preflight requests** - OPTIONS requests should work

#### Request Size Limits
- [ ] **Test large payloads** - Send > 5MB request, should be rejected
- [ ] **Test file upload limits** - Upload large files, should be limited

#### Error Handling
- [ ] **Test error responses** - Should not leak:
  - Database connection strings
  - File paths
  - Stack traces (in production)
  - Internal error details

---

### 4. Data Security Tests

#### Password Security
- [ ] **Test password strength** - Weak passwords should be rejected
- [ ] **Test password hashing** - Passwords should be hashed (not plain text)
- [ ] **Test password reset** - If implemented, should be secure

#### Sensitive Data Exposure
- [ ] **Check API responses** - No passwords, tokens, or secrets in responses
- [ ] **Check error messages** - No sensitive info in errors
- [ ] **Check logs** - No passwords or tokens in logs

#### Data Validation
- [ ] **Test email validation** - Invalid emails rejected
- [ ] **Test phone number validation** - Invalid formats rejected
- [ ] **Test date validation** - Invalid dates rejected
- [ ] **Test required fields** - Missing required fields rejected

---

### 5. Security Headers Tests

#### Check Response Headers
- [ ] **X-Content-Type-Options: nosniff** - Present
- [ ] **X-Frame-Options: DENY** - Present
- [ ] **X-XSS-Protection: 1; mode=block** - Present
- [ ] **Strict-Transport-Security** - Present (HSTS)
- [ ] **Content-Security-Policy** - Present
- [ ] **Referrer-Policy** - Present

#### Test with Browser DevTools
```javascript
// In browser console
fetch('https://your-api.com/api/users/me', {
  credentials: 'include'
}).then(r => {
  console.log('Headers:', [...r.headers.entries()]);
});
```

---

### 6. File Upload Security (if applicable)

- [ ] **Test file type validation** - Only allowed types accepted
- [ ] **Test file size limits** - Large files rejected
- [ ] **Test malicious file names** - Path traversal attempts blocked
- [ ] **Test virus scanning** - If implemented, works correctly

---

### 7. Dependency Security

- [ ] **Run npm audit**:
  ```bash
  cd server && npm audit
  cd client && npm audit
  ```
- [ ] **Fix high/critical vulnerabilities**:
  ```bash
  npm audit fix
  ```
- [ ] **Check for outdated packages**:
  ```bash
  npm outdated
  ```

---

### 8. Environment & Configuration

- [ ] **Check .env files** - Not committed to git
- [ ] **Check environment variables** - All required vars set
- [ ] **Check JWT_SECRET** - At least 32 characters, random
- [ ] **Check NODE_ENV** - Set to "production"
- [ ] **Check CORS_ORIGIN** - Only production domain(s)
- [ ] **Check database credentials** - Strong passwords, not default

---

### 9. Logging & Monitoring

- [ ] **Test error logging** - Errors logged correctly
- [ ] **Test failed login logging** - Attempts logged
- [ ] **Check log files** - No sensitive data in logs
- [ ] **Test log rotation** - Logs don't grow indefinitely

---

### 10. Production Build Tests

#### Server
- [ ] **Test production mode**:
  ```bash
  cd server
  NODE_ENV=production npm start
  ```
- [ ] **Verify no dev tools** - No nodemon, no debug logs
- [ ] **Test error messages** - Generic errors (no stack traces)

#### Client
- [ ] **Build production version**:
  ```bash
  cd client
  npm run build
  ```
- [ ] **Test production build** - Works correctly
- [ ] **Check bundle size** - Reasonable size (< 5MB)
- [ ] **Test source maps** - Disabled in production (optional)

---

## 🛠️ Free Security Testing Tools

### 1. **OWASP ZAP (Zed Attack Proxy)** - FREE
- **What**: Automated security scanner
- **Install**: Download from https://www.zaproxy.org/
- **Usage**:
  1. Start your server
  2. Open ZAP
  3. Enter your URL
  4. Run "Quick Start" scan
  5. Review findings

### 2. **npm audit** - FREE (Built-in)
- **What**: Checks npm dependencies for vulnerabilities
- **Usage**:
  ```bash
  cd server && npm audit
  cd client && npm audit
  npm audit fix  # Auto-fix issues
  ```

### 3. **Snyk** - FREE (Open Source)
- **What**: Dependency vulnerability scanner
- **Install**: `npm install -g snyk`
- **Usage**:
  ```bash
  snyk auth  # Free account required
  snyk test
  snyk monitor
  ```

### 4. **Retire.js** - FREE
- **What**: Scans for outdated JavaScript libraries
- **Install**: `npm install -g retire`
- **Usage**:
  ```bash
  retire --path client/
  retire --path server/
  ```

### 5. **ESLint Security Plugin** - FREE
- **What**: Finds security issues in code
- **Install**: `npm install --save-dev eslint-plugin-security`
- **Usage**: Add to `.eslintrc.js`

### 6. **OWASP Dependency-Check** - FREE
- **What**: Checks dependencies for known vulnerabilities
- **Install**: Download from https://owasp.org/www-project-dependency-check/
- **Usage**: Run against your project

### 7. **Mozilla Observatory** - FREE (Online)
- **What**: Tests security headers
- **URL**: https://observatory.mozilla.org/
- **Usage**: Enter your production URL

### 8. **Security Headers** - FREE (Online)
- **What**: Checks security headers
- **URL**: https://securityheaders.com/
- **Usage**: Enter your production URL

### 9. **SSL Labs** - FREE (Online)
- **What**: Tests SSL/TLS configuration
- **URL**: https://www.ssllabs.com/ssltest/
- **Usage**: Enter your production URL (if using HTTPS)

### 10. **Burp Suite Community Edition** - FREE
- **What**: Web vulnerability scanner
- **Download**: https://portswigger.net/burp/communitydownload
- **Usage**: Intercept and test requests

---

## 📋 Quick Test Script

Create a test file `security-test.sh`:

```bash
#!/bin/bash

echo "🔒 Security Testing Checklist"
echo "============================"

# 1. Dependency Check
echo "1. Checking dependencies..."
cd server && npm audit
cd ../client && npm audit

# 2. Environment Check
echo "2. Checking environment variables..."
if [ -z "$JWT_SECRET" ]; then
  echo "❌ JWT_SECRET not set"
else
  echo "✅ JWT_SECRET is set"
fi

# 3. Build Check
echo "3. Building production..."
cd client && npm run build
if [ $? -eq 0 ]; then
  echo "✅ Client build successful"
else
  echo "❌ Client build failed"
fi

echo "============================"
echo "✅ Basic checks complete"
```

---

## 🚨 Critical Tests (Must Do Before Production)

1. ✅ **Run npm audit** and fix critical issues
2. ✅ **Test rate limiting** - Prevents brute force
3. ✅ **Test authentication** - Login/logout works
4. ✅ **Test authorization** - Permissions enforced
5. ✅ **Test input validation** - Malicious input rejected
6. ✅ **Check error messages** - No sensitive info leaked
7. ✅ **Test CORS** - Only allowed origins work
8. ✅ **Build production** - Both server and client
9. ✅ **Test production build** - Everything works
10. ✅ **Check security headers** - All present

---

## 📝 Testing Results Template

```
Date: ___________
Tester: ___________

Authentication: [ ] Pass [ ] Fail
Authorization: [ ] Pass [ ] Fail
Input Validation: [ ] Pass [ ] Fail
Rate Limiting: [ ] Pass [ ] Fail
CORS: [ ] Pass [ ] Fail
Security Headers: [ ] Pass [ ] Fail
Dependencies: [ ] Pass [ ] Fail
Production Build: [ ] Pass [ ] Fail

Issues Found:
1. 
2. 
3. 

Notes:
```

---

## ⚡ Quick Start Testing

1. **Install tools**:
   ```bash
   npm install -g snyk retire
   ```

2. **Run automated checks**:
   ```bash
   # Server
   cd server
   npm audit
   snyk test
   
   # Client
   cd ../client
   npm audit
   snyk test
   retire --path .
   ```

3. **Manual testing**:
   - Test login with invalid credentials
   - Test rate limiting
   - Check security headers
   - Test production build

4. **Online tools**:
   - Test security headers: https://securityheaders.com/
   - Test SSL: https://www.ssllabs.com/ssltest/

---

## ✅ Sign-Off

After completing all tests:

- [ ] All critical tests passed
- [ ] All vulnerabilities fixed
- [ ] Production build tested
- [ ] Security headers verified
- [ ] Ready for production deployment

**Approved by**: _________________  
**Date**: _________________

