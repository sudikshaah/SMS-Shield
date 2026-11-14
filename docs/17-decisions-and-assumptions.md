# 17. Architecture Decisions, Assumptions & Risk Log

> **Document Status:** Living Record (Initial Baseline)  
> **Project ID:** NLP-04  
> **Product Working Title:** SMS Shield  
> **Custodian:** M1 (Project Lead)

---

## 1. Confirmed Decisions

These decisions have been formally approved by the team and project lead. They are binding on all development activities and AI coding assistants.

| Decision ID | Topic | Decision Made | Rationale |
| :--- | :--- | :--- | :--- |
| **DEC-01** | Primary Programming Language | Python 3.10+ | Standard language for NLP, Scikit-learn, and lightweight web APIs. |
| **DEC-02** | Web Framework | Flask (REST API + Templates) | Simple, un-opinionated, lightweight; avoids framework configuration overhead. |
| **DEC-03** | Frontend Architecture | HTML5 + Modern CSS + Vanilla JavaScript (ES6+) | Eliminates Node.js build pipelines and npm dependencies; allows instant deployment. |
| **DEC-04** | Client Charting Library | Chart.js (v4.4+) | Fast, responsive, canvas-based; renders easily from JSON payloads. |
| **DEC-05** | Primary Classifier | Multinomial Naive Bayes | Industry and academic benchmark for sparse text bag-of-words/TF-IDF data. |
| **DEC-06** | Secondary Comparison Model | Logistic Regression | Provides well-calibrated probabilities and linear feature weight interpretability. |
| **DEC-07** | Feature Extraction | Scikit-learn `TfidfVectorizer` | High speed, small footprint, high discriminative power for short SMS texts. |
| **DEC-08** | Model Serialization | Joblib (`models/model_pipeline.joblib`) | Standard in Python data science for persisting Scikit-learn pipelines. |
| **DEC-09** | Testing Framework | Pytest | Clean, readable assertion syntax and fixtures. |
| **DEC-10** | Exclusion of Heavy Tech | No React, Docker, Redis, Celery, or MongoDB | Prevents over-engineering within the 2–3 week timeline. |

---

## 2. Proposed Decisions (Pending Implementation & Verification)

These proposals represent the current architectural blueprint but must be validated during development before being marked as confirmed facts.

| Proposal ID | Topic | Proposed Specification | Verification Condition |
| :--- | :--- | :--- | :--- |
| **PROP-01** | Dataset Source | UCI Machine Learning Repository - SMS Spam Collection | M1 must download, inspect schema, and verify row count and encoding. |
| **PROP-02** | Decision Threshold | 0.50 default probability threshold for Spam | Evaluate ROC-PR curves to determine if higher threshold (e.g. 0.60) reduces False Positives. |
| **PROP-03** | TF-IDF Max Features | Cap vocabulary at 3,000 to 5,000 features | Verify that accuracy and memory footprint are balanced during training on test split. |
| **PROP-04** | Bulk CSV Max Upload Size | 5 Megabytes (~20,000 SMS lines) | Verify that local Flask process can parse 5 MB within 3 seconds without memory spike. |
| **PROP-05** | N-Gram Range | Unigrams and Bigrams `(1, 2)` | Verify whether bigrams improve Spam classification F1-Score over unigrams alone. |

---

## 3. Assumptions Log

*Rule: Never silently convert an assumption into a confirmed fact.*

1. **Dataset Language:** Assumed that all messages in the primary evaluation dataset are in English. Non-English or romanized regional slang (e.g., Hinglish) will be evaluated as out-of-vocabulary tokens.
2. **Execution Environment:** Assumed that all team members and evaluators run standard desktop computers with Python 3.10+ and standard operating systems (Windows 10/11, macOS, or Linux).
3. **Single-User Local Deployment:** Assumed that the application is executed locally (`http://127.0.0.1:5000`) for academic evaluation and does not require multi-tenant authentication, concurrent user sessions, or distributed worker queues.
4. **CSV Delimiters:** Assumed that uploaded batch CSV files use standard comma (`,`) or tab (`\t`) delimiters with standard UTF-8 or ASCII encoding.

---

## 4. Risks & Mitigation Strategies

| Risk ID | Risk Description | Severity | Probability | Mitigation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | High False Positive rate (legitimate Ham messages flagged as Spam). | **High** | Medium | Prioritize high Precision over Recall. Inspect top false positives in confusion matrix and adjust classification threshold. |
| **RSK-02** | Desynchronization between training preprocessor and inference preprocessor. | **High** | Low | Package the preprocessor as a shared module (`src/nlp/preprocessor.py`) used by both `train.py` and `routes.py`. Test via Pytest. |
| **RSK-03** | Corrupt or non-standard CSV upload crashes server. | **Medium** | High | Implement strict defensive checks in `src/utils/validators.py` and catch `pd.errors.EmptyDataError` and `ParserError`. |
| **RSK-04** | Team members overwriting each other's code on GitHub. | **High** | Medium | Enforce strict feature branches per member (`feature/m*-...`) and require pull request approvals before merging into `develop`. |
| **RSK-05** | Beginners getting stuck on complex dependencies. | **Medium** | Medium | Restrict technology stack to standard libraries and simple tools; document full setup in `README.md`. |

---

## 5. Deferred Features (Post-MVP / Phase 2)

These features are officially out of scope for the 18-day MVP but documented for future enhancement or viva discussion:
1. **Explainable Token Highlighting:** Visually highlighting words in the SMS that contributed most strongly to the spam score (using TF-IDF weights or LIME/SHAP).
2. **Persistent Relational Database (SQLite):** Storing historic scan results or user feedback for retraining.
3. **Multi-Model Dynamic Selector:** Allowing the user to toggle between Multinomial Naive Bayes, Logistic Regression, and Support Vector Machines (LinearSVC) directly from the UI dropdown.
4. **Multilingual Support:** Preprocessing and classification pipelines for messages in languages other than English.
