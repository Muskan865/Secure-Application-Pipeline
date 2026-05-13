# Remediation Report
**LuxeMart Application**
**Assessment Date:** May 12, 2026
**Assessed Components:** Frontend (React), Backend (Node.js/Express)

---

## Executive Summary

The LuxeMart application underwent a Static Application Security Testing (SAST) assessment on May 12, 2026, identifying 5 vulnerabilities across injection, access control, and security misconfiguration categories. This report documents the remediation effort undertaken by this team, covering all 5 of those findings across the React frontend and Node.js/Express backend.

---

## Risk Summary

At the time of initial discovery, the application presented a significant attack surface. The most severe finding allowed an attacker to inject arbitrary SQL into the admin reports endpoint, exposing the full database including user credentials and the JWT signing secret. Additional findings enabled stored XSS via unsanitized product descriptions, open redirects abusing the trusted LuxeMart domain for phishing, and path traversal attacks capable of reading `.env` credentials directly from the server filesystem. Collectively, these vulnerabilities placed all user session data, application secrets, and database contents at immediate risk of compromise.

---

## Business Impact

| Impact Area | Description |
|---|---|
| **Data Breach** | Full database exposed via SQL injection including credentials and JWT secrets |
| **Account Takeover** | Session hijacking via XSS cookie theft viable without elevated privilege |
| **Phishing Risk** | Open redirect allows attackers to weaponize the trusted LuxeMart domain |
| **Secret Exposure** | Path traversal grants unauthenticated read access to `.env` including `DB_PASSWORD` and `JWT_SECRET` |
| **Reputational Damage** | An e-commerce platform with exploitable product descriptions and unvalidated redirects fundamentally undermines customer trust |

---

## Recommendations

1. Never render user-controlled HTML without sanitization — use React's default escaping or DOMPurify with a strict allowlist.
2. Validate all redirect targets against an explicit allowlist of trusted domains before issuing any redirect.
3. Use parameterized queries exclusively — string concatenation into SQL must be treated as a critical defect in code review.
4. Resolve file paths against a fixed base directory and reject any path that escapes it before performing filesystem reads.
5. Avoid world-writable directories (e.g. `/tmp`) as base paths for file serving.
6. Integrate Semgrep and SonarCloud as blocking quality gates in the CI/CD pipeline to catch regressions before merge.

---

## Vulnerability Summary

| ID | Vulnerability | Severity | CVSS | Status |
|---|---|---|---|---|
| V1 | XSS | High | 7.3 | Fixed |
| V2 | Open Redirect — Unvalidated URL Parameter (Rule 1) | High | 6.1 | Fixed |
| V3 | Open Redirect — Unvalidated URL Parameter (Rule 2) | High | 6.1 | Fixed |
| V4 | SQL Injection in Admin Reports Endpoint | Critical | 9.8 | Fixed |
| V5 | Path Traversal in File Download Endpoint | High | 7.5 | Fixed |

---

## Remediation Methodology

Each vulnerability was addressed through the following workflow:

1. **GitHub Issue** — A concise issue was opened on the repository describing the finding and expected fix.
2. **Branch** — A dedicated feature branch was created from `main` for the fix (e.g. `fix/vuln1-xss-dompurify`).
3. **Fix** — The root-cause code change was implemented on the branch.
4. **Pull Request** — A PR was opened referencing the issue, reviewed, and merged.
5. **Re-test** — The fix was verified by repeating the original proof-of-concept. Failure of the exploit confirms effectiveness.
6. **Regression** — Unit or integration tests were added where applicable to prevent recurrence.

---

## Detailed Findings and Remediations

---

### Vulnerability 1: Cross-Site Scripting (XSS) via `dangerouslySetInnerHTML`

| Field | Details |
|---|---|
| **Severity** | HIGH — Blocking |
| **Category** | Cross-Site Scripting (XSS) |
| **OWASP** | A03:2021 – Injection |
| **CWE** | CWE-79 |
| **CVSS Score** | 7.3 (High) |
| **Affected File** | `Application/src/main.jsx` — Line 45 |

#### Description

User-controlled content is passed directly, bypassing React's built-in XSS protections. A malicious seller can store a script payload in a product description that executes silently in every customer's browser who views the product.

#### Steps to Reproduce (Pre-Fix)

1. Login as seller: `seller@luxemart.com` / `seller123`
2. Go to Dashboard → Edit any product
3. In the Description field paste:
   ```html
   <img src=x onerror="alert('XSS! Cookie: ' + document.cookie)">
   ```
4. Save the product
5. Login as customer: `customer@luxemart.com` / `customer123`
6. Navigate to that product's detail page
7. **Result:** Alert fires with session cookies

#### Impact

- Session hijacking via cookie theft
- Silent credential exfiltration to attacker-controlled server
- Arbitrary script execution in victim's browser context

#### GitHub Issue

https://github.com/Muskan865/Secure-Application-Pipeline/issues/10

#### Fix Applied

**File:** `Application/src/main.jsx`

```javascript
// ❌ Before
  return <div SetInnerHTML={{ __html: content }} />;

// ✅ After — React escapes by default
function renderText(content) {
  return <div>{content}</div>;
}
```

#### Re-Test Steps

1. Login as seller and paste XSS payload into product description
2. Save the product
3. Login as customer and navigate to that product page
4. Observe — no alert should fire; payload should render as plain text

#### Re-Test Evidence

> *Screenshot to be added here*

---

### Vulnerability 2: Open Redirect via Unvalidated URL Parameter (Rule 1)

| Field | Details |
|---|---|
| **Severity** | HIGH — Blocking |
| **Category** | Open Redirect |
| **OWASP** | A05:2021 – Security Misconfiguration |
| **CWE** | CWE-601 |
| **CVSS Score** | 6.1 (Medium-High) |
| **Affected File** | `server/index.js` — Line 185 |

#### Description

The `/api/redirect` endpoint accepts an arbitrary `url` query parameter and redirects to it without validation, allowing attackers to abuse the trusted LuxeMart domain for phishing.

#### Steps to Reproduce (Pre-Fix)

1. Ensure backend is running on `http://localhost:4000`
2. Open in browser:
   ```
   http://localhost:4000/api/redirect?url=https://google.com
   ```
3. **Result:** Redirected to Google — any URL is accepted

#### Impact

- Phishing attacks using a trusted LuxeMart URL
- Credential harvesting via fake login pages
- Bypass of email/browser security filters

#### GitHub Issue

https://github.com/Muskan865/Secure-Application-Pipeline/issues/11

#### Fix Applied

**File:** `server/index.js`

```javascript
// ❌ Before
app.get("/api/redirect", async (req, res) => {
  const redirectUrl = req.query.url;
  res.redirect(redirectUrl);
});

// ✅ After
app.get("/api/redirect", async (req, res) => {
  const redirectUrl = req.query.url;
  const allowedDomains = ["luxemart.com", "www.luxemart.com"];

  try {
    const url = new URL(redirectUrl);
    if (!allowedDomains.includes(url.hostname)) {
      return res.status(400).json({ message: "Redirect target not allowed" });
    }
    const safeUrl = url.href;
    return res.redirect(safeUrl);
  } catch (e) {
    return res.status(400).json({ message: "Invalid URL" });
  }
});
```

> **Note:** This single fix also resolves Vulnerability 3, which is the same line flagged by a second Semgrep rule.

#### Re-Test Steps

1. Try redirecting to an external domain:
   ```
   http://localhost:4000/api/redirect?url=https://google.com
   ```
2. **Expected:** `400 – Redirect target not allowed`

#### Re-Test Evidence

> *Screenshot to be added here*

---

### Vulnerability 3: Open Redirect via Unvalidated URL Parameter (Rule 2)

| Field | Details |
|---|---|
| **Severity** | HIGH — Blocking |
| **Category** | Open Redirect |
| **OWASP** | A05:2021 – Security Misconfiguration |
| **CWE** | CWE-601 |
| **CVSS Score** | 6.1 (Medium-High) |
| **Affected File** | `server/index.js` — Line 185 |

#### Description

Same vulnerable code location as Vulnerability 2, flagged independently by Semgrep's `express-open-redirect` rule via taint analysis confirming `req.query` flows into `res.redirect()`.
Same vulnerability testing and fix as Vulnerability 2.


---

### Vulnerability 4: SQL Injection in Admin Reports Endpoint

| Field | Details |
|---|---|
| **Severity** | CRITICAL — Blocking |
| **Category** | SQL Injection |
| **OWASP** | A03:2021 – Injection |
| **CWE** | CWE-89 |
| **CVSS Score** | 9.8 (Critical) |
| **Affected File** | `server/index.js` — Route: `POST /api/admin/reports` |

#### Description

The `reportType` request body parameter is concatenated directly into a SQL query, allowing an attacker to inject arbitrary SQL and read, modify, or destroy the entire database.

#### Steps to Reproduce (Pre-Fix)

1. Run in PowerShell:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:4000/api/admin/reports" `
     -Method POST `
     -ContentType "application/json" `
     -Body '{"reportType": "'' OR ''1''=''1"}'
   ```
2. **Result:** All rows returned — WHERE clause fully bypassed

#### Impact

- Full database exposure
- User credential and password hash dump
- Table deletion / data destruction
- JWT secret exposure enabling forged tokens

#### GitHub Issue

https://github.com/Muskan865/Secure-Application-Pipeline/issues/14

#### Fix Applied

**File:** `server/index.js`

```javascript
// ❌ Before
app.post("/api/admin/reports", async (req, res) => {
  const { reportType } = req.body;
  const data = await pool.query(`SELECT * FROM reports WHERE type = '${reportType}'`);
  res.json(data.rows);
});

// ✅ After — parameterized query
app.post("/api/admin/reports", async (req, res) => {
  const { reportType } = req.body;
  const data = await pool.query("SELECT * FROM reports WHERE type = $1", [reportType]);
  res.json(data.rows);
});
```

#### Re-Test Steps

1. Run the injection payload again:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:4000/api/admin/reports" `
     -Method POST `
     -ContentType "application/json" `
     -Body '{"reportType": "'' OR ''1''=''1"}'
   ```
2. **Expected:** Empty array `[]` returned — injection string treated as literal value, no rows match

#### Re-Test Evidence

> *Screenshot to be added here*

---

### Vulnerability 5: Path Traversal in File Download Endpoint

| Field | Details |
|---|---|
| **Severity** | HIGH — Blocking |
| **Category** | Path Traversal |
| **OWASP** | A01:2021 – Broken Access Control |
| **CWE** | CWE-22 |
| **CVSS Score** | 7.5 (High) |
| **Affected File** | `server/index.js` — Route: `GET /api/download` |

#### Description

The `file` query parameter is concatenated into a file path without directory boundary validation. An attacker can use `../` sequences to escape the downloads directory and read arbitrary server files including `.env` credentials.

#### Steps to Reproduce (Pre-Fix)

1. Normal request (baseline):
   ```
   http://localhost:4000/api/download?file=report.txt
   ```
2. Path traversal exploit to read `.env`:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:4000/api/download?file=..%2Fcyber_project%2FSecure-Application-Pipeline%2Fserver%2F.env"
   ```
3. **Result:** `.env` contents returned including `DB_PASSWORD`, `DB_USER`, `JWT_SECRET`

#### Impact

- Database credential exposure
- JWT secret exposure — forged tokens possible
- Full server source code readable
- Any file readable within the process user's permissions

#### GitHub Issue

https://github.com/Muskan865/Secure-Application-Pipeline/issues/15

#### Fix Applied

**File:** `server/index.js`

```javascript
// ❌ Before
app.get("/api/download", async (req, res) => {
  const file = req.query.file;
  const fs = await import("fs");
  const path = await import("path");
  const filePath = path.resolve("/tmp/downloads/" + file);
  const content = fs.readFileSync(filePath, "utf8");
  res.json({ content });
});

// ✅ After — boundary check + safe base directory
app.get("/api/download", async (req, res) => {
  const file = req.query.file;
  const fs = await import("fs");
  const path = await import("path");

  const allowedDir = path.resolve("./downloads"); 
  const filePath = path.resolve(allowedDir, file);

  if (!filePath.startsWith(allowedDir + path.sep)) {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const content = fs.readFileSync(filePath, "utf8");
    res.json({ content });
  } catch {
    res.status(404).json({ message: "File not found" });
  }
});
```

> **Note:** Base directory changed from `/tmp/downloads` to `./downloads` to also resolve SonarCloud's world-writable directory warning.

#### Re-Test Steps

1. Run the traversal exploit again:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:4000/api/download?file=..%2Fcyber_project%2FSecure-Application-Pipeline%2Fserver%2F.env"
   ```
2. **Expected:** `403 – Access denied`
3. Run a normal request:
   ```
   http://localhost:4000/api/download?file=report.txt
   ```
4. **Expected:** File contents returned normally

#### Re-Test Evidence

> *Screenshot to be added here*

```

**Expected result:** `0 findings (0 blocking)` from Semgrep, quality gate passing on SonarCloud.
