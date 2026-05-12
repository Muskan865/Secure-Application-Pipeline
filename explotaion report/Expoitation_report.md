# Exploitation Report
**LuxeMart Application — SAST Findings**
**Assessment Date:** May 12, 2026
**Assessed Components:** Frontend (React), Backend (Node.js/Express)
**Assessment Tools:** Semgrep, SonarCloud

---

## Vulnerability 1: Cross-Site Scripting (XSS) via dangerouslySetInnerHTML

| Field | Details |
|---|---|
| **Severity** | HIGH — Blocking |
| **Category** | Cross-Site Scripting (XSS) |
| **OWASP** | A03:2021 – Injection |
| **CWE** | CWE-79 |
| **CVSS Score** | 7.3 (High) |
| **Discovery Method** | Semgrep — Rule: `typescript.react.security.audit.react-dangerouslysetinnerhtml` |
| **Affected File** | `Application/src/main.jsx` — Line 45 |

### OWASP Justification
This falls under **A03:2021 – Injection** because unsanitized user-controlled data is injected into the browser DOM, bypassing React's built-in XSS protections and allowing execution of arbitrary scripts.

### Description
The React component passes a non-constant, user-controlled value directly. React's default XSS protection is bypassed when this API is used, meaning any HTML or JavaScript in `content` is rendered and executed in the browser. An attacker with seller access can store a malicious payload in a product description that executes in every customer's browser who views that product.

### Steps to Reproduce
1. Login as seller: `seller@luxemart.com` / `seller123`
2. Go to **Dashboard → Edit any product**
3. In the **Description** field, paste:
   ```html
   <img src=x onerror="alert('XSS! Cookie: ' + document.cookie)">
   ```
4. Save the product
5. Logout and login as customer: `customer@luxemart.com` / `customer123`
6. Browse to that product's detail page
7. **Result:** Alert fires showing the customer's cookies

### Impact
- Session hijacking via cookie theft
- Credential harvesting via fake login forms injected into the page
- Redirection of customers to malicious phishing sites
- Silent exfiltration of session tokens to attacker-controlled servers

### Evidence
![xss](images/xss_1a.png)
![xss](images/xss_1b.png)

### Remediation
Replace `dangerouslySetInnerHTML` with safe plain text rendering:
```javascript
function renderText(content) {
  return <div>{content}</div>;
}
```
Or sanitize with DOMPurify if HTML rendering is required.

---

## Vulnerability 2: Open Redirect via Unvalidated URL Parameter (Rule 1)

| Field | Details |
|---|---|
| **Severity** | HIGH — Blocking |
| **Category** | Open Redirect |
| **OWASP** | A05:2021 – Security Misconfiguration |
| **CWE** | CWE-601 |
| **CVSS Score** | 6.1 (Medium-High) |
| **Discovery Method** | Semgrep — Rule: `javascript.express.security.audit.possible-user-input-redirect` |
| **Affected File** | `server/index.js` — Line 185 |

### OWASP Justification
Classified under **A05:2021 – Security Misconfiguration** as the application fails to restrict or validate external redirect targets, enabling abuse of trusted domain reputation to facilitate phishing attacks.

### Description
The redirect endpoint reads a `url` parameter directly from the query string and redirects the user to it without any validation. An attacker can craft a link that appears to come from the trusted LuxeMart domain but sends the user to a malicious site. Victims trust the initial domain in the URL before being redirected.

### Steps to Reproduce
1. Ensure backend is running on `http://localhost:4000`
2. Open in browser:
   ```
   http://localhost:4000/api/redirect?url=https://google.com
   ```
3. **Result:** Redirected to Google — confirms any arbitrary URL is accepted

### Impact
- Phishing attacks leveraging the trusted LuxeMart domain
- Credential harvesting when users are redirected to fake login pages
- Reputational damage to LuxeMart if the domain is used in phishing campaigns
- Bypass of browser/email security filters that trust the originating domain

### Evidence
![redirect](2a.png)
![redirect](2b.png)

### Remediation
Validate the redirect target against an allowlist of trusted domains:
```javascript
const allowedDomains = ["luxemart.com", "www.luxemart.com"];
const url = new URL(redirectUrl);
if (!allowedDomains.includes(url.hostname)) {
  return res.status(400).json({ message: "Redirect target not allowed" });
}
```

---

## Vulnerability 3: Open Redirect via Unvalidated URL Parameter (Rule 2)

| Field | Details |
|---|---|
| **Severity** | HIGH — Blocking |
| **Category** | Open Redirect |
| **OWASP** | A05:2021 – Security Misconfiguration |
| **CWE** | CWE-601 |
| **CVSS Score** | 6.1 (Medium-High) |
| **Discovery Method** | Semgrep — Rule: `javascript.express.security.audit.express-open-redirect` |
| **Affected File** | `server/index.js` — Line 185 |

### OWASP Justification
Same as Vulnerability 2. The `express-open-redirect` rule specifically traces the `req` object as a taint source, confirming that user-supplied input from `req.query` flows unvalidated into `res.redirect()`.

### Description
This is the same vulnerable code location as Vulnerability 2, flagged by a second complementary Semgrep rule. The `express-open-redirect` rule performs taint analysis from the `req` object to confirm unvalidated user input reaches `res.redirect()`. Both rules flag the same line; one fix resolves both findings.

### Steps to Reproduce
Same as Vulnerability 2.

### Impact
Same as Vulnerability 2.

### Evidence
![redirect](2a.png)
![redirect](2b.png)

### Remediation
Same fix as Vulnerability 2 — one code change resolves both Semgrep findings.

---

## Vulnerability 4: SQL Injection in Admin Reports Endpoint

| Field | Details |
|---|---|
| **Severity** | CRITICAL — Blocking |
| **Category** | SQL Injection |
| **OWASP** | A03:2021 – Injection |
| **CWE** | CWE-89 |
| **CVSS Score** | 9.8 (Critical) |
| **Discovery Method** | SonarCloud |
| **Affected File** | `server/index.js` — Route: `POST /api/admin/reports` |

### OWASP Justification
Classified under **A03:2021 – Injection** as user-controlled input (`reportType`) is directly concatenated into a SQL query without parameterization, allowing arbitrary SQL commands to be executed against the database.

### Description
The `reportType` parameter from the request body is directly concatenated into a SQL query string. This allows an attacker to inject SQL syntax that modifies the query's logic — bypassing filters, extracting all rows, dumping credentials, or destroying data entirely.

### Steps to Reproduce
1. Ensure backend is running on `http://localhost:4000`
2. Run in PowerShell:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:4000/api/admin/reports" `
     -Method POST `
     -ContentType "application/json" `
     -Body '{"reportType": "'' OR ''1''=''1"}'
   ```
3. **Result:** All rows returned — `WHERE` clause bypassed

More destructive payloads:
```sql
' OR 1=1; DROP TABLE products; --
' UNION SELECT id,email,password,role,name FROM users --
```

### Impact
- Full database read access — all tables exposed
- Credential dumping — usernames, hashed passwords, roles
- Data destruction — tables can be dropped
- Privilege escalation — admin credentials retrievable

### Evidence
![alt text](4a.png)
![alt text](4b.png)

### Remediation
Use parameterized queries:
```javascript
const data = await pool.query("SELECT * FROM reports WHERE type = $1", [reportType]);
```

---

## Vulnerability 5: Path Traversal in File Download Endpoint

| Field | Details |
|---|---|
| **Severity** | HIGH — Blocking |
| **Category** | Path Traversal |
| **OWASP** | A01:2021 – Broken Access Control |
| **CWE** | CWE-22 |
| **CVSS Score** | 7.5 (High) |
| **Discovery Method** | SonarCloud |
| **Affected File** | `server/index.js` — Route: `GET /api/download` |

### OWASP Justification
Classified under **A01:2021 – Broken Access Control** as the application fails to restrict file access to the intended directory, allowing attackers to read files outside the permitted scope — including credentials and source code.

### Description
The `file` query parameter is concatenated directly into a file path without validation. An attacker can use `../` sequences to escape the intended downloads directory and read arbitrary files on the server filesystem, including `.env` files containing database credentials and JWT secrets.

### Steps to Reproduce
1. Ensure backend is running on `http://localhost:4000`
2. Normal request (baseline):
   ```
   http://localhost:4000/api/download?file=report.txt
   ```
3. Path traversal to read `.env` credentials:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:4000/api/download?file=..%2Fcyber_project%2FSecure-Application-Pipeline%2Fserver%2F.env"
   ```
4. **Result:** Contents of `.env` returned including `DB_PASSWORD`, `DB_USER`, `JWT_SECRET`

### Impact
- Exposure of database credentials (`DB_USER`, `DB_PASSWORD`)
- Exposure of `JWT_SECRET` enabling forged authentication tokens
- Source code disclosure via reading `index.js` and other server files
- Full server filesystem read access within the process user's permissions

### Evidence
![alt text](5.png)

### Remediation
Validate that the resolved path stays within the allowed directory:
```javascript
const allowedDir = path.resolve("./downloads");
const filePath = path.resolve(allowedDir, file);
if (!filePath.startsWith(allowedDir + path.sep)) {
  return res.status(403).json({ message: "Access denied" });
}
```

---

## Summary Table

| ID | Vulnerability | Severity | CVSS | Tool | Affected File |
|---|---|---|---|---|---|
| 1 | XSS via dangerouslySetInnerHTML | HIGH | 7.3 | Semgrep | `Application/src/main.jsx` |
| 2 | Open Redirect (user input check) | HIGH | 6.1 | Semgrep | `server/index.js` |
| 3 | Open Redirect (express check) | HIGH | 6.1 | Semgrep | `server/index.js` |
| 4 | SQL Injection in Admin Reports | CRITICAL | 9.8 | SonarCloud | `server/index.js` |
| 5 | Path Traversal in Download | HIGH | 7.5 | SonarCloud | `server/index.js` |

---

## Severity Distribution

- **CRITICAL:** 1 — SQL Injection
- **HIGH:** 4 — XSS, Open Redirect ×2, Path Traversal