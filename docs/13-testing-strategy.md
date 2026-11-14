# 13. Comprehensive Testing Strategy & Verification Plan

> **Document Status:** `PROPOSED` Baseline  
> **Project ID:** NLP-04  
> **Product Working Title:** SMS Shield  
> **Author:** M1 (Project Lead)  
> **Contributors:** M2, M3, M4, M5

---

## 1. Testing Philosophy & Verification Pyramid

In an academic machine learning software engineering project, rigorous testing is essential to demonstrate that:
1. NLP preprocessing is deterministic, safe, and does not corrupt meaningful language tokens.
2. Machine learning models are evaluated with scientific rigor (no data leakage, proper baseline comparisons).
3. The web API and user interface handle unexpected edge cases, corrupt files, and malformed inputs gracefully.

```
                     / \
                    /   \
                   / Acc \   <-- Acceptance Testing (Manual Live Scenarios)
                  /-------\
                 /  Integ  \  <-- API & End-to-End Tests (Flask Test Client)
                /-----------\
               /    Unit     \ <-- NLP, Preprocessing, Validators, Model Logic
              /---------------\
```

---

## 2. Test Suite Organization

All automated tests are written for **Pytest** and organized under `tests/`:

```text
tests/
├── __init__.py
├── conftest.py             # Shared fixtures (mock models, test app, sample SMS)
├── test_nlp.py             # NLP preprocessing, regex, tokenization unit tests
├── test_models.py          # Vectorization, inference, and serialization tests
└── test_api.py             # Flask route integration and CSV upload tests
```

---

## 3. Detailed Test Categories & Cases

### 3.1 Unit Testing: NLP Preprocessing (`tests/test_nlp.py`)
*Owner: M2 (NLP Developer)*

| Test ID | Test Scenario | Input Text | Expected Output / Assertion |
| :--- | :--- | :--- | :--- |
| **UT-NLP-01** | Basic Lowercasing | `"Hello WORLD"` | Cleaned string contains `"hello world"`. |
| **UT-NLP-02** | URL Masking | `"Check http://scam.org and https://win.com now"` | URLs replaced by `<URL>` tokens: `"check <URL> and <URL> now"`. |
| **UT-NLP-03** | Phone/Number Masking | `"Call 9876543210 for prize £500"` | Digits and currency replaced: `"call <NUM> for prize <CURR>"`. |
| **UT-NLP-04** | Negation Preservation | `"I am not happy and no I will never come"` | Words `"not"`, `"no"`, `"never"` are NOT removed by stopword filter. |
| **UT-NLP-05** | Punctuation Removal | `"Great!!! Win??? Yes... Now!!!"` | Punctuation removed without deleting word characters: `"great win yes now"`. |
| **UT-NLP-06** | Whitespace Stripping | `"  Too    much    spacing   "` | Cleaned string is single-space delimited: `"too much spacing"`. |
| **UT-NLP-07** | Empty String Handling | `""` or `"    "` | Returns empty string `""` without throwing unhandled exceptions. |
| **UT-NLP-08** | Emojis & Non-ASCII | `"Win cash 🔥🔥🔥 claim now"` | Emojis stripped or ignored safely, alphanumeric tokens preserved. |

---

### 3.2 Unit Testing: Model Inference & Evaluation (`tests/test_models.py`)
*Owner: M3 (Machine Learning Developer)*

| Test ID | Test Scenario | Assertion / Verification Criteria |
| :--- | :--- | :--- |
| **UT-MOD-01** | Model Artifact Loading | `load_pipeline("models/model_pipeline.joblib")` returns an initialized pipeline instance. |
| **UT-MOD-02** | Probability Range Check | `predict_message(model, "sample text")["confidence"]` is strictly between $0.0$ and $1.0$. |
| **UT-MOD-03** | Canonical Ham Test | Typical interpersonal text (e.g., `"Hey mom, see you tonight"`) outputs label `"HAM"`. |
| **UT-MOD-04** | Canonical Spam Test | High-frequency spam words (e.g., `"Claim free entry cash prize now call <NUM>"`) outputs label `"SPAM"`. |
| **UT-MOD-05** | Stratified Split Invariant | Train set and test set have the same ratio of Ham to Spam ($\pm 1\%$). |
| **UT-MOD-06** | Vocabulary Bounds Check | Fitted `TfidfVectorizer` vocabulary size is $\le 5,000$ features. |

---

### 3.3 Integration Testing: Flask REST APIs (`tests/test_api.py`)
*Owner: M4 (Backend Developer)*

| Test ID | Endpoint | Method | Test Condition | Expected HTTP Status & Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **IT-API-01** | `/` | `GET` | Root request from browser | `200 OK`, HTML contains `<title>SMS Shield</title>`. |
| **IT-API-02** | `/api/health` | `GET` | Server readiness probe | `200 OK`, JSON `"status": "success"`, `"model_loaded": true`. |
| **IT-API-03** | `/api/predict` | `POST` | Valid JSON payload with SMS text | `200 OK`, JSON contains `"label"`, `"confidence"`, `"cleaned_text"`. |
| **IT-API-04** | `/api/predict` | `POST` | Missing `"text"` key or empty string | `400 Bad Request`, JSON contains `"code": "VALIDATION_ERROR"`. |
| **IT-API-05** | `/api/predict` | `POST` | Oversized text (> 1,000 characters) | `400 Bad Request`, JSON contains `"code": "PAYLOAD_TOO_LARGE"`. |
| **IT-API-06** | `/api/bulk-predict` | `POST` | Valid CSV file upload (100 rows) | `200 OK`, JSON summary totals equal 100, `"download_url"` provided. |
| **IT-API-07** | `/api/bulk-predict` | `POST` | Non-CSV file uploaded (e.g., `.png` image) | `415 Unsupported Media Type`, JSON error returned. |
| **IT-API-08** | `/api/bulk-predict` | `POST` | File larger than 5 MB | `413 Payload Too Large`, gracefully rejected. |
| **IT-API-09** | `/api/analytics` | `GET` | Request corpus statistics | `200 OK`, returns non-null dataset metrics and confusion matrix. |

---

### 3.4 Frontend Usability & Cross-Browser Verification
*Owner: M5 (Frontend Developer)*

- **Viewport Testing:** Tested across Desktop (1920x1080, 1366x768), Tablet (768x1024), and Mobile (375x667 iPhone SE).
- **DOM Safety (XSS Check):** Test pasting malicious script string:
  `<script>alert('XSS')</script> congratulations you won £1000`
  *Verification:* Ensure browser displays literal text characters and does NOT execute the alert dialog.
- **Dynamic Chart Verification:** Confirm Chart.js canvas destroys and redraws without memory leaks when new CSV data is loaded.

---

## 4. Test Execution & Reporting Protocols

### 4.1 Running the Automated Test Suite
From the repository root:
```bash
# Run all automated tests with verbose output:
pytest tests/ -v

# Run only NLP unit tests:
pytest tests/test_nlp.py -v

# Run tests and generate coverage report:
pytest --cov=src tests/
```

### 4.2 Test Verification Logging
In adherence to `AGENTS.md` anti-hallucination rules, test results must NEVER be fabricated. Every pull request and turn report must record the exact console output produced by the test runner.
