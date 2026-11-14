# 11. Role-Specific AI Coding Agent Workflows

> **Document Status:** `PROPOSED` Baseline  
> **Project ID:** NLP-04  
> **Product Working Title:** SMS Shield  
> **Audience:** All AI coding assistants (Gemini, Claude, Copilot, Cursor) assisting human team members M1 through M5.

---

## 1. Operating Rules for AI Agents

Every AI assistant working in this repository is assigned to assist a **specific team member**. An AI agent must NEVER assume it owns the entire codebase or make unilateral architectural modifications. 

Before generating any code or executing any change, every agent must follow this lifecycle:
```
1. Inspect Scope & Existing Code 
       --> 2. Read Relevant Docs in docs/ 
             --> 3. Implement Isolated Changes 
                   --> 4. Run Automated Tests 
                         --> 5. Update Documentation 
                               --> 6. Structured Handover Report
```

---

## 2. Agent Workflow: M1 (Project Lead & Data Analytics)

### 2.1 Scope & Boundaries
- **Permitted Modifications:** `src/analytics/`, `notebooks/`, `docs/`, `README.md`.
- **Restricted (Approval Required):** Modifying `src/nlp/`, `src/models/`, `src/api/`, `static/`, or `templates/` without coordinating with the assigned pair.

### 2.2 Pre-Turn Inspection Checklist
1. Inspect `data/raw/` to verify dataset presence and integrity.
2. Read `docs/07-data-models.md` and `docs/04-system-architecture.md`.
3. Check the current git status and branch.

### 2.3 Implementation Protocol
- When building analytics routines, write pure, side-effect-free functions in `src/analytics/engine.py`.
- Compute class distributions, character lengths, and word counts using vectorized Pandas/NumPy methods.

### 2.4 Validation & Testing
- Validate that corpus counts match total dataset rows exactly.
- Test that output JSON serialization produces native Python types (convert NumPy `int64` / `float64` to standard `int` / `float`).

### 2.5 Handover & Documentation
- Update `docs/07-data-models.md` with verified dataset statistics.
- Hand off summary array formats to **M4 (Backend)** and **M5 (Frontend)**.

---

## 3. Agent Workflow: M2 (NLP & Text Preprocessing)

### 3.1 Scope & Boundaries
- **Permitted Modifications:** `src/nlp/`, `tests/test_nlp.py`.
- **Restricted (Approval Required):** Modifying model training parameters (`src/models/`), API routes (`src/api/`), or frontend UI.

### 3.2 Pre-Turn Inspection Checklist
1. Inspect existing functions in `src/nlp/preprocessor.py`.
2. Inspect existing unit test assertions in `tests/test_nlp.py`.
3. Review `docs/03-feature-specification.md` (Section 1: Preprocessing Pipeline).

### 3.3 Implementation Protocol
- Maintain deterministic regex patterns for URLs (`<URL>`), phone numbers/currency (`<NUM>`, `<CURR>`), and punctuation.
- Ensure negation words (`not`, `no`, `never`, `neither`, `nor`, `can't`, `won't`) are strictly preserved in the token stream.
- Ensure zero external network calls (e.g., do not download NLTK data at runtime inside `clean_text()`).

### 3.4 Validation & Testing
- Execute:
  ```bash
  pytest tests/test_nlp.py -v
  ```
- Ensure 100% of preprocessing unit tests pass before ending the turn.
- Test edge cases: empty strings, pure emojis, strings with only numbers, extreme whitespace.

### 3.5 Handover & Documentation
- Document any modified regex rules in `docs/03-feature-specification.md`.
- Hand off the signature `clean_text(text: str) -> str` to **M3 (ML)**.

---

## 4. Agent Workflow: M3 (Machine Learning Developer)

### 4.1 Scope & Boundaries
- **Permitted Modifications:** `src/models/`, `models/`, `tests/test_models.py`.
- **Restricted (Approval Required):** Altering preprocessing regex in `src/nlp/` or Flask routing in `src/api/`.

### 4.2 Pre-Turn Inspection Checklist
1. Verify `src/nlp/preprocessor.py` exists and passes unit tests.
2. Read `docs/07-data-models.md` (TF-IDF configuration and pipeline schema).
3. Read `docs/04-system-architecture.md` (Offline Training Workflow).

### 4.3 Implementation Protocol
- Always use `StratifiedKFold` or `train_test_split(..., stratify=y, random_state=42)`.
- Fit `TfidfVectorizer` ONLY on `X_train`. Never fit on `X_test` or entire corpus at once.
- Save pipeline using `joblib.dump()`.
- Save metrics (Precision, Recall, F1, Confusion Matrix) to `models/metrics_summary.json`.

### 4.4 Validation & Testing
- Execute:
  ```bash
  python src/models/train.py
  pytest tests/test_models.py -v
  ```
- Verify that Spam F1-Score $\ge 0.90$ and Precision $\ge 0.95$.
- Verify that `predict_message(pipeline, sample_text)` returns valid probabilities ($0.0 \le p \le 1.0$).

### 4.5 Handover & Documentation
- Update `docs/15-viva-preparation.md` with final achieved test metrics.
- Hand off `models/model_pipeline.joblib` and `src/models/predict.py` to **M4 (Backend)**.

---

## 5. Agent Workflow: M4 (Backend Developer)

### 5.1 Scope & Boundaries
- **Permitted Modifications:** `app.py`, `src/api/`, `src/utils/`, `tests/test_api.py`.
- **Restricted (Approval Required):** Modifying frontend CSS/JS or altering ML model hyper-parameters.

### 5.2 Pre-Turn Inspection Checklist
1. Review `docs/08-api-contracts.md` for exact endpoint routes, parameter names, and status codes.
2. Verify that `models/model_pipeline.joblib` exists on disk or write mock fixtures.
3. Inspect `src/utils/validators.py` for file size and input checks.

### 5.3 Implementation Protocol
- Implement routes matching the exact contracts (`GET /`, `GET /api/health`, `POST /api/predict`, `POST /api/bulk-predict`, `GET /api/download/<id>`, `GET /api/analytics`).
- Load the model artifact into memory ONCE during application startup; never reload inside route handlers.
- Return structured error JSON with appropriate HTTP status codes (400, 413, 415, 500).

### 5.4 Validation & Testing
- Execute:
  ```bash
  pytest tests/test_api.py -v
  ```
- Test each endpoint with valid payloads and edge cases (missing keys, empty text, invalid file types).

### 5.5 Handover & Documentation
- If any API response field is added or renamed, immediately update `docs/08-api-contracts.md` and notify **M5 (Frontend)**.

---

## 6. Agent Workflow: M5 (Frontend Developer)

### 6.1 Scope & Boundaries
- **Permitted Modifications:** `templates/`, `static/css/`, `static/js/`, `static/img/`.
- **Restricted (Approval Required):** Modifying Flask backend endpoints, ML models, or preprocessor code.

### 6.2 Pre-Turn Inspection Checklist
1. Read `docs/08-api-contracts.md` to confirm exact JSON keys returned by backend APIs.
2. Read `docs/03-feature-specification.md` for UI acceptance criteria and edge case displays.
3. Inspect `templates/index.html` and `static/js/app.js`.

### 6.3 Implementation Protocol
- Write semantic HTML5 and clean, modular CSS using CSS custom properties.
- Use Vanilla JavaScript (ES6+ `async/await` and `fetch()`).
- Always sanitize text when inserting into the DOM: use `element.textContent = ...` instead of `element.innerHTML = ...` to prevent XSS attacks.
- Handle all network states: loading spinner, success badge, and error alert banners.

### 6.4 Validation & Testing
- Open application in browser: test single SMS submit, bulk CSV drag-and-drop, and tab navigation.
- Verify that Chart.js canvas elements resize properly on window resize and mobile viewports.
- Verify browser console produces zero unhandled promise rejections or JavaScript errors.

### 6.5 Handover & Documentation
- Document any new UI selectors or user interaction flows in `docs/03-feature-specification.md`.
- Report completed interface to **M1 (Lead)** for integration sign-off.
