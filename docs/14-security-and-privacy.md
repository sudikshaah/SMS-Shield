# 14. Security, Privacy & Defensive Engineering Guidelines

> **Document Status:** `PROPOSED` Baseline  
> **Project ID:** NLP-04  
> **Product Working Title:** SMS Shield  
> **Lead Author:** M4 (Backend Developer)  
> **Reviewers:** M1, M2, M3, M5

---

## 1. Security Overview & Threat Model

While SMS Shield is an academic web application, adhering to defensive engineering practices demonstrates professional software craftsmanship. The threat model focuses on protecting the local application from:
1. **Denial of Service (DoS):** Memory exhaustion from oversized text payloads or massive CSV uploads.
2. **Arbitrary Code Execution via Deserialization:** Insecure loading of untrusted `.joblib` / `.pkl` model files.
3. **Cross-Site Scripting (XSS):** Injecting malicious JavaScript payloads into user-submitted SMS messages rendered in the browser.
4. **Local File Inclusion & Path Traversal:** Accessing unauthorized server files via manipulated bulk download parameters.
5. **Data Privacy Leaks:** Exposing sensitive personal SMS communications uploaded during batch processing.

---

## 2. Defensive Engineering Protocols

### 2.1 File Upload & Size Limits
- **Maximum File Size Enforcement:** Flask is configured with a strict payload limit:
  ```python
  app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5 Megabytes
  ```
- **MIME & Extension Whitelisting:**
  - Files uploaded to `/api/bulk-predict` must have the `.csv` extension.
  - The MIME type must be checked against permitted types (`text/csv`, `text/plain`, `application/vnd.ms-excel`).
- **Filename Sanitization:** Never trust the client-provided filename. Use `werkzeug.utils.secure_filename()` combined with unique UUIDs:
  ```python
  import uuid
  from werkzeug.utils import secure_filename

  safe_name = f"bulk_{uuid.uuid4().hex}.csv"
  ```

---

### 2.2 Safe Temporary File Handling & Privacy
- **In-Memory Preference:** Whenever possible, process uploaded CSV files directly in memory using `io.StringIO` or `pandas.read_csv(file_stream)` without writing to disk.
- **Isolated Ephemeral Storage:** If temporary files are written to disk for downloading (e.g., in `data/temp_bulk/`):
  - Files are given random UUID names.
  - Files are restricted to the designated directory; path traversal attempts (e.g., `../../etc/passwd` or `..\Windows\System32`) are blocked via strict regex validation on the `file_id` URL parameter (`^[a-f0-9\-]{36}$`).
  - An automatic cleanup routine deletes files older than 30 minutes.
- **User Privacy:** Uploaded SMS messages are processed purely for inference and temporary download; they are never permanently logged, scraped, or retained in persistent databases.

---

### 2.3 Input Sanitization & XSS Prevention
- **Backend Sanitization:**
  - Single SMS text input is capped at 1,000 characters.
  - Empty or whitespace-only inputs are rejected with HTTP 400.
- **Frontend DOM Safety:**
  - In `static/js/app.js`, user-submitted text and preview rows must NEVER be injected using `innerHTML`.
  - Always use `element.textContent = data.original_text` or create text nodes via `document.createTextNode()`. This renders any embedded `<script>` tags as harmless plain text.

---

### 2.4 Model Deserialization Security (`Joblib` & `Pickle`)
- **Vulnerability Warning:** Python `joblib` and `pickle` deserialization can execute arbitrary code if loading untrusted files (`__reduce__` exploit).
- **Rule of Engagement:**
  - The application must **ONLY** load model artifacts authored and trained locally within this repository (`models/model_pipeline.joblib`).
  - Never allow end-users to upload custom model files via web forms or APIs.
  - Do not download pre-compiled binary model files from untrusted third-party URLs.

---

### 2.5 Secrets & Git Exclusion Management (`.gitignore`)
The repository `.gitignore` must strictly prevent committed credentials, virtual environments, raw caches, and intermediate runtime artifacts:

```gitignore
# Virtual Environment
venv/
env/
ENV/
.env

# Python Bytecode & Cache
__pycache__/
*.py[cod]
*$py.class
.pytest_cache/
.coverage
htmlcov/

# Data & Models (Large binaries & raw data)
data/raw/*
!data/raw/.gitkeep
data/processed/*
!data/processed/.gitkeep
data/temp_bulk/*
!data/temp_bulk/.gitkeep
models/*.joblib
!models/.gitkeep

# IDE & OS Files
.vscode/
.idea/
.DS_Store
Thumbs.db
```
