# Remediation Report
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
| **Status** | 🔴 Requires Fix |
| **Affected File** | `Application/src/main.jsx` — Line 45 |

### Description
User-controlled content is passed directly into `dangerouslySetInnerHTML`, bypassing React's built-in XSS protections. A malicious seller can store a script payload in a product description that executes silently in every customer's browser who views the product.

### Steps to Reproduce (Pre-Fix)
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

### Impact
- Session hijacking via cookie theft
- Silent credential exfiltration to attacker-controlled server
- Arbitrary script execution in victim's browser context

### GitHub Issue
> *Link to be added here*

### Fix Applied

**File:** `Application/src/main.jsx`

```javascript
// ❌ Before
function renderUnsafeHTML(content) {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}

// ✅ After — React escapes by default
function renderText(content) {
  return <div>{content}</div>;
}

// ✅ Alternative — DOMPurify if HTML rendering is needed
import DOMPurify from "dompurify";

function renderSafeHTML(content) {
  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"],
    ALLOWED_ATTR: []
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
```

### Re-Test Steps
1. Login as seller and paste XSS payload into product description
2. Save the product
3. Login as customer and navigate to that product page
4. Observe — no alert should fire; payload should render as plain text

### Re-Test Result
> ⬜ Pending re-test

### Re-Test Evidence
> *Screenshot to be added here*

---

## Vulnerability 2: Open Redirect via Unvalidated URL Parameter (Rule 1)

| Field | Details |
|---|---|
| **Severity** | HIGH — Blocking |
| **Category** | Open Redirect |
| **OWASP** | A05:2021 – Security Misconfiguration |
| **CWE** | CWE-601 |
| **CVSS Score** | 6.1 (Medium-High) |
| **Status** | 🔴 Requires Fix |
| **Affected File** | `server/index.js` — Line 185 |

### Description
The `/api/redirect` endpoint accepts an arbitrary `url` query parameter and redirects to it without validation, allowing attackers to abuse the trusted LuxeMart domain for phishing.

### Steps to Reproduce (Pre-Fix)
1. Ensure backend is running on `http://localhost:4000`
2. Open in browser:
   ```
   http://localhost:4000/api/redirect?url=https://google.com
   ```
3. **Result:** Redirected to Google — any URL is accepted

### Impact
- Phishing attacks using a trusted LuxeMart URL
- Credential harvesting via fake login pages
- Bypass of email/browser security filters

### GitHub Issue
> *Link to be added here*

### Fix Applied

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

### Re-Test Steps
1. Try redirecting to an external domain:
   ```
   http://localhost:4000/api/redirect?url=https://google.com
   ```
2. **Expected:** `400 – Redirect target not allowed`
3. Try with an allowed domain:
   ```
   http://localhost:4000/api/redirect?url=https://luxemart.com
   ```
4. **Expected:** Redirect succeeds

### Re-Test Result
> ⬜ Pending re-test

### Re-Test Evidence
> *Screenshot to be added here*

---

## Vulnerability 3: Open Redirect via Unvalidated URL Parameter (Rule 2)

| Field | Details |
|---|---|
| **Severity** | HIGH — Blocking |
| **Category** | Open Redirect |
| **OWASP** | A05:2021 – Security Misconfiguration |
| **CWE** | CWE-601 |
| **CVSS Score** | 6.1 (Medium-High) |
| **Status** | 🔴 Requires Fix |
| **Affected File** | `server/index.js` — Line 185 |

### Description
Same vulnerable code location as Vulnerability 2, flagged independently by Semgrep's `express-open-redirect` rule via taint analysis confirming `req.query` flows into `res.redirect()`.

### Steps to Reproduce (Pre-Fix)
Same as Vulnerability 2.

### Impact
Same as Vulnerability 2.

### GitHub Issue
> *Link to be added here*

### Fix Applied
Same fix as Vulnerability 2 — one code change resolves both findings. See Vulnerability 2 fix above.

### Re-Test Steps
Same as Vulnerability 2.

### Re-Test Result
> ⬜ Pending re-test

### Re-Test Evidence
> *Screenshot to be added here*

---

## Vulnerability 4: SQL Injection in Admin Reports Endpoint

| Field | Details |
|---|---|
| **Severity** | CRITICAL — Blocking |
| **Category** | SQL Injection |
| **OWASP** | A03:2021 – Injection |
| **CWE** | CWE-89 |
| **CVSS Score** | 9.8 (Critical) |
| **Status** | 🔴 Requires Fix |
| **Affected File** | `server/index.js` — Route: `POST /api/admin/reports` |

### Description
The `reportType` request body parameter is concatenated directly into a SQL query, allowing an attacker to inject arbitrary SQL and read, modify, or destroy the entire database.

### Steps to Reproduce (Pre-Fix)
1. Ensure backend is running on `http://localhost:4000`
2. Run in PowerShell:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:4000/api/admin/reports" `
     -Method POST `
     -ContentType "application/json" `
     -Body '{"reportType": "'' OR ''1''=''1"}'
   ```
3. **Result:** All rows returned — WHERE clause fully bypassed

### Impact
- Full database exposure
- User credential and password hash dump
- Table deletion / data destruction
- JWT secret exposure enabling forged tokens

### GitHub Issue
> *Link to be added here*

### Fix Applied

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

### Re-Test Steps
1. Run the injection payload again:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:4000/api/admin/reports" `
     -Method POST `
     -ContentType "application/json" `
     -Body '{"reportType": "'' OR ''1''=''1"}'
   ```
2. **Expected:** Empty array `[]` returned — injection string treated as literal value, no rows match

### Re-Test Result
> ⬜ Pending re-test

### Re-Test Evidence
> *Screenshot to be added here*

---

## Vulnerability 5: Path Traversal in File Download Endpoint

| Field | Details |
|---|---|
| **Severity** | HIGH — Blocking |
| **Category** | Path Traversal |
| **OWASP** | A01:2021 – Broken Access Control |
| **CWE** | CWE-22 |
| **CVSS Score** | 7.5 (High) |
| **Status** | 🔴 Requires Fix |
| **Affected File** | `server/index.js` — Route: `GET /api/download` |

### Description
The `file` query parameter is concatenated into a file path without directory boundary validation. An attacker can use `../` sequences to escape the downloads directory and read arbitrary server files including `.env` credentials.

### Steps to Reproduce (Pre-Fix)
1. Normal request (baseline):
   ```
   http://localhost:4000/api/download?file=report.txt
   ```
2. Path traversal exploit to read `.env`:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:4000/api/download?file=..%2Fcyber_project%2FSecure-Application-Pipeline%2Fserver%2F.env"
   ```
3. **Result:** `.env` contents returned including `DB_PASSWORD`, `DB_USER`, `JWT_SECRET`

### Impact
- Database credential exposure
- JWT secret exposure — forged tokens possible
- Full server source code readable
- Any file readable within the process user's permissions

### GitHub Issue
> *Link to be added here*

### Fix Applied

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

  const allowedDir = path.resolve("./downloads"); // Not /tmp — avoids world-writable dir
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

### Re-Test Steps
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

### Re-Test Result
> ⬜ Pending re-test

### Re-Test Evidence
> *Screenshot to be added here*

---

## Remediation Summary Table

| ID | Vulnerability | Severity | CVSS | Status | Fix Location |
|---|---|---|---|---|---|
| 1 | XSS via dangerouslySetInnerHTML | HIGH | 7.3 | 🔴 Requires Fix | `Application/src/main.jsx` |
| 2 | Open Redirect (user input check) | HIGH | 6.1 | 🔴 Requires Fix | `server/index.js` |
| 3 | Open Redirect (express check) | HIGH | 6.1 | 🔴 Requires Fix | `server/index.js` (same as #2) |
| 4 | SQL Injection in Admin Reports | CRITICAL | 9.8 | 🔴 Requires Fix | `server/index.js` |
| 5 | Path Traversal in Download | HIGH | 7.5 | 🔴 Requires Fix | `server/index.js` |

---

## Re-Test Checklist

After all fixes are committed, re-run both tools:

```bash
# Semgrep
semgrep scan --config p/security-audit --config p/owasp-top-ten --config p/secrets --error .

# SonarCloud — push to trigger pipeline
git push
```

**Expected result:** `0 findings (0 blocking)` from Semgrep, quality gate passing on SonarCloud.