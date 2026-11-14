# AGENTS.md: AI Coding Agent Collaboration Manual & Single Source of Truth

> **Project ID:** NLP-04  
> **Product Title:** SMS Text Cleaning and Classification System (SMS Shield)  
> **Repository:** `AI-proj-3rd-sem`  
> **Audience:** All AI coding assistants (Gemini, Claude, ChatGPT, GitHub Copilot, Cursor, etc.) and human developers working in this repository.

---

## 1. Project Context & Objectives

**SMS Shield** is an academic software engineering project undertaken by 5 undergraduate B.Tech CSE students over a 2–3 week timeline. The goal is to build a reliable, explainable, and production-clean web application that:
1. Preprocesses raw, noisy SMS messages.
2. Classifies them as **HAM** (legitimate) or **SPAM** (unsolicited / malicious) using trained Scikit-learn models (Multinomial Naive Bayes and Logistic Regression).
3. Provides an interactive web UI for single message classification and bulk CSV file prediction.
4. Visualizes dataset and prediction analytics using Chart.js.

### Academic Constraints & Realism Principles:
- **No Over-Engineering:** Do NOT add complex microservices, Docker, Kubernetes, React, Redis, Celery, MongoDB, or heavyweight deep learning frameworks (PyTorch, TensorFlow) unless explicitly instructed in writing by the Project Lead.
- **Maintainability Over Complexity:** All code must be straightforward, well-commented, beginner-friendly, and accompanied by automated tests.
- **Explainability:** In academic evaluations, explainability of why an SMS was classified as Spam/Ham (e.g., word probabilities, TF-IDF weights) is valued more than black-box complexity.

---

## 2. Source-of-Truth Hierarchy

When resolving conflicts or uncertain specifications, consult sources in this strict order:

1. **`docs/17-decisions-and-assumptions.md`** & **`AGENTS.md`** (System boundaries, ground rules, confirmed decisions).
2. **`docs/08-api-contracts.md`** & **`docs/07-data-models.md`** (Inter-module interfaces and data schemas).
3. **`docs/02-prd.md`** & **`docs/03-feature-specification.md`** (Product requirements and acceptance criteria).
4. **Existing Code & Automated Tests** in `src/` and `tests/`.
5. **Role-Specific Documentation** (`docs/10-team-responsibilities.md`, `docs/11-agent-workflows.md`).
6. **External Assumptions or Default Agent Intuitions** (Lowest precedence – never override written documentation).

---

## 3. The 20 Mandatory Anti-Hallucination Rules

Every AI agent working in this repository MUST strictly abide by these rules. Violations compromise academic evaluation and break teammates' workflows.

1. **Inspect Before Acting:** Always inspect existing repository files, directories, and code before making recommendations, writing code, or suggesting changes.
2. **Read Relevant Documentation:** Review the pertinent document in `docs/` before editing any component.
3. **Repository Reality as Truth:** Treat repository documentation and actual code as the source of truth, not generic assumptions or external templates.
4. **No Fabricated Entities:** Never invent files, functions, classes, API endpoints, dependencies, database tables, model metrics, or claims of completed features.
5. **Explicit UNKNOWN Labeling:** If a statistic, parameter, or status is unknown, explicitly state `UNKNOWN`.
6. **Explicit PROPOSED Labeling:** If an architecture, contract, or design is planned but not yet implemented, explicitly state `PROPOSED`.
7. **Explicit IMPLEMENTED – NOT VERIFIED Labeling:** If code exists but automated tests have not executed or passed, label it `IMPLEMENTED – NOT VERIFIED`.
8. **Explicit VERIFIED Labeling:** Only mark a feature or metric `VERIFIED` after executing relevant tests in the active environment and providing concrete test outputs.
9. **Never Fabricate Test Results:** Never state "all tests passed" without actually running `pytest` or the test runner and capturing real output.
10. **Never Claim an API Works Without Testing:** Never claim a Flask endpoint works without executing an automated test or direct HTTP request.
11. **Do Not Silently Mutate API Contracts:** Never change a shared API endpoint path, payload format, or response schema without updating `docs/08-api-contracts.md` and alerting affected roles.
12. **Do Not Mutate ML Pipeline Silently:** Never change the text cleaning regex, tokenization logic, or vectorizer hyper-parameters without synchronizing between M2 (NLP) and M3 (ML).
13. **Do Not Overwrite Another Member's Work:** Respect code ownership. If working on backend APIs, do not refactor the frontend or ML pipeline without coordination.
14. **No Architectural Drift:** Do not replace Flask with FastAPI, vanilla JS with React, or Joblib with pickle/ONNX without approval from Project Lead (M1).
15. **Prefer Small, Reviewable Changes:** Keep edits modular, cohesive, and clearly scoped to the assigned task.
16. **Explicit File Modification Accounting:** After every edit turn, list every file created, modified, or deleted with a rationale.
17. **Run Tests & Report Concrete Evidence:** Always run relevant unit/integration tests after modifications and paste genuine console outputs.
18. **Synchronize Documentation:** Whenever an implementation change affects documented behavior, update the corresponding file in `docs/`.
19. **Surface Conflicting Requirements:** If instructions or documents conflict, explicitly report the conflict to the user rather than arbitrarily choosing a side.
20. **Ask When Uncertain:** If a critical design decision or parameter is missing, ask a concise clarification question rather than guessing.

---

## 4. Team Structure & Directory Ownership

All agents must operate within the designated boundaries of the team member they are assisting.

| Member ID | Role | Primary Files & Directory Scope | Read-Only Dependencies |
| :--- | :--- | :--- | :--- |
| **M1** | Project Lead & Data Analytics | `src/analytics/`, `notebooks/eda.ipynb`, `data/`, `docs/`, `README.md` | Inspects all modules for integration |
| **M2** | NLP & Preprocessing Developer | `src/nlp/`, `tests/test_nlp.py` | Consumes `data/raw/` samples |
| **M3** | Machine Learning Developer | `src/models/`, `models/*.joblib`, `tests/test_models.py` | Imports `src/nlp/preprocessor.py` |
| **M4** | Backend Developer | `app.py`, `src/api/`, `src/utils/`, `tests/test_api.py` | Imports `src/models/`, `src/nlp/`, `src/analytics/` |
| **M5** | Frontend Developer | `templates/`, `static/css/`, `static/js/`, `static/img/` | Consumes JSON contracts from `docs/08-api-contracts.md` |

### Multi-Agent Interaction Protocol:
- If an agent acting as **M4 (Backend)** needs a change in the preprocessor, it must NOT directly modify `src/nlp/preprocessor.py`. It must document a feature request for **M2 (NLP)** and coordinate.
- If an agent acting as **M5 (Frontend)** needs a new field in `/api/predict`, it must request the field in accordance with `docs/08-api-contracts.md` rather than mocking backend changes.

---

## 5. Coding Conventions & Standards

### 5.1 Python Backend & ML (`src/`, `app.py`, `tests/`)
- **Version:** Python 3.10+
- **Style:** PEP 8 compliance. 4 spaces for indentation. Max line length: 88-100 characters.
- **Type Hints:** Use standard Python type hints for function signatures:
  ```python
  def clean_text(text: str, preserve_negations: bool = True) -> str:
      ...
  ```
- **Docstrings:** Standard Google-style or Sphinx-style docstrings on all public classes, methods, and functions:
  ```python
  def predict_sms(text: str) -> dict[str, any]:
      """Clean and classify a single SMS text.

      Args:
          text: The raw input SMS text message.

      Returns:
          A dictionary containing 'label', 'confidence', and 'cleaned_text'.
      """
  ```
- **Error Handling:** Do not use bare `except:`. Catch specific exceptions (`ValueError`, `FileNotFoundError`, `KeyError`) and log or return informative HTTP errors.
- **Imports:** Group imports: standard library first, third-party libraries second, local application imports third.

### 5.2 Frontend (`static/`, `templates/`)
- **HTML:** Semantic HTML5 (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`). Accessible labels on all `<input>` elements.
- **CSS:** Plain modern CSS with custom variables (CSS custom properties) defined in `:root` for colors, fonts, and spacing. No Tailwind or Bootstrap unless explicitly decided.
- **JavaScript:** Clean, modern Vanilla JavaScript (ES6+). Use `async/await` for fetch requests. Avoid global variable pollution by encapsulating in modules or scoped closures.
- **DOM Safety:** Use `textContent` or sanitized DOM node creation when rendering untrusted user SMS text. Never set raw user input directly to `innerHTML` (Cross-Site Scripting protection).

---

## 6. Machine Learning Rules

1. **Stratified Split:** Always use stratified train-test splitting (recommended: 80% train, 20% test) to preserve the real-world ham/spam class distribution.
2. **No Data Leakage:** Fit `TfidfVectorizer` ONLY on training data (`X_train`). Transform test data (`X_test`) and runtime inference data without re-fitting.
3. **Identical Preprocessing:** The exact same cleaning function (`src/nlp/preprocessor.py`) must be executed during model training, evaluation, and live inference.
4. **Metrics Beyond Accuracy:** Always report Precision, Recall, F1-Score, and Confusion Matrix. Explain why False Positives (legitimate SMS marked as Spam) are especially hazardous.
5. **Realistic Confidence Scores:** Present probabilities (e.g., from `predict_proba`) as confidence estimates, not absolute guarantees.
6. **No Runtime Retraining:** The web server must load the saved `.joblib` model artifact into memory upon startup; never retrain models per request.

---

## 7. Mandatory AI Response Format

Whenever an AI coding assistant completes a task or turn in this repository, it must end its response using this structured format:

```markdown
### Task Completion Report

- **Task Completed:** [Concise description of the goal achieved]
- **Files Created / Modified:**
  - `path/to/file1.py` - [Reason for change]
  - `path/to/file2.md` - [Reason for change]
- **Implementation Summary:** [2-4 sentences describing technical approach and key decisions]
- **Tests Executed:** [List of test commands run, e.g., `pytest tests/test_nlp.py`]
- **Actual Test Results:** [Verbatim test runner output or exact pass/fail count]
- **Known Limitations:** [Edge cases or deferred constraints]
- **Documentation Updated:** [Which docs in `docs/` were updated to reflect changes]
- **Handover Instructions:** [Instructions for the next team member or agent]
- **Outstanding Questions:** [Any unclarified design points requiring project lead decision]
```

---

## 8. Directory-Scoped AGENTS Guidance

For agents working inside specific subdirectories, refer to the local scoped instructions:
- `src/AGENTS.md` - Backend, ML, and NLP implementation rules.
- `tests/AGENTS.md` - Test development, test fixtures, and assertion guidelines.
