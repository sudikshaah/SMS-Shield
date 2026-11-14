# Scoped Developer & Agent Guidelines: `tests/`

> **Directory Scope:** `tests/` (Automated Test Suite)  
> **Parent Manual:** Consult root [AGENTS.md](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/AGENTS.md) for overarching repository policies.

---

## 1. Test Suite Layout

All automated tests use **Pytest**:

- **`tests/test_nlp.py` (Owned by M2):**
  - Unit tests verifying text preprocessing:
    - Lowercase conversion.
    - URL masking/removal (e.g., `http://spam.link` -> `<URL>`).
    - Punctuation stripping without corrupting words.
    - Stopword filtering while preserving negations (`not`, `no`, `never`).
    - Handling edge cases: empty strings, numbers-only, non-ASCII characters, excessive whitespace.

- **`tests/test_models.py` (Owned by M3):**
  - Verification of model pipeline behavior:
    - Serialization and deserialization via Joblib.
    - Deterministic predictions for known canonical ham and spam inputs.
    - Output format validation (`label`, `confidence_score` between 0.0 and 1.0).
    - Consistency between training-time preprocessing and inference-time preprocessing.

- **`tests/test_api.py` (Owned by M4):**
  - Integration tests for Flask endpoints using Flask's test client (`client.get()`, `client.post()`):
    - `GET /` returns HTTP 200 and loads HTML.
    - `GET /api/health` returns status `ok`.
    - `POST /api/predict` with valid payload returns HTTP 200 and expected JSON structure.
    - `POST /api/predict` with empty or missing payload returns HTTP 400.
    - `POST /api/bulk-predict` with valid CSV returns HTTP 200, summary stats, and result records.
    - `POST /api/bulk-predict` with non-CSV or oversized file returns HTTP 400 or HTTP 413.

---

## 2. Testing Anti-Hallucination & Execution Rules

1. **Concrete Execution:** Never declare tests as passing without running `pytest` in the terminal and examining the stdout/stderr.
2. **Fast & Isolated:** Unit tests in `test_nlp.py` must run in under 2 seconds and have zero external network dependencies.
3. **Mocking External Resources:** If the final trained model is not yet saved to `models/`, model tests must use a lightweight dummy model fixture rather than failing silently or assuming the model exists.
4. **No Flaky Assertions:** Avoid asserting exact float confidence scores (e.g., `assert score == 0.893452`). Instead use range checks or `pytest.approx()` (e.g., `assert 0.0 <= score <= 1.0`).
