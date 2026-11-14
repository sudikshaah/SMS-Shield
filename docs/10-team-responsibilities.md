# 10. Team Responsibility Matrix & Deliverable Ownership

> **Document Status:** `PROPOSED` Baseline  
> **Project ID:** NLP-04  
> **Product Working Title:** SMS Shield  
> **Team Structure:** 5 Undergraduate B.Tech CSE Engineers (2 Pairs + 1 Project Lead)  
> **Author:** M1 (Project Lead)

---

## 1. Team Structure Overview

To ensure clear accountability and avoid overlap or unassigned work, the team is organized into two engineering pairs overseen by the Project Lead:

```
                          +------------------------------------+
                          |        M1: Project Lead &          |
                          |          Data Analytics            |
                          +-----------------+------------------+
                                            |
                    +-----------------------+-----------------------+
                    |                                               |
                    v                                               v
    +-------------------------------+               +-------------------------------+
    |   Pair 1: NLP & ML Pipeline   |               | Pair 2: Full-Stack Application|
    |  - M2: NLP & Preprocessing    |               |  - M4: Backend Developer      |
    |  - M3: Machine Learning Dev   |               |  - M5: Frontend Developer     |
    +-------------------------------+               +-------------------------------+
```

---

## 2. Member-by-Member Detailed Profiles

### Member 1 (M1): Project Lead & Data Analytics
- **Role:** Project Lead, Data Analyst & Technical Documentation Coordinator
- **Assigned Code & Files:**
  - `src/analytics/engine.py`
  - `notebooks/01_eda_and_prototyping.ipynb`
  - `docs/` (Architecture, PRD, Decisions, Viva guide)
  - `README.md`
- **Required Skills:** Python, Pandas, Matplotlib/Seaborn (for EDA), Markdown, Git project management.
- **Learning Requirements:** Basic understanding of class imbalance in text datasets, vocabulary statistics, and GitHub pull request reviews.
- **Concrete Tasks & Deliverables:**
  1. Download and verify the UCI SMS Spam Collection in `data/raw/`.
  2. Perform Exploratory Data Analysis (EDA) in Jupyter Notebook to compute class distributions and message length statistics.
  3. Implement `src/analytics/engine.py` returning structured metrics arrays for the web dashboard.
  4. Coordinate repository branching, code reviews, and milestone sign-offs.
  5. Compile the formal academic report and final presentation deck.
- **Dependencies:** Relies on raw dataset availability; receives model metrics from M3.
- **Handovers:**
  - Hands verified dataset statistics to M4 and M5 for API and dashboard charting.
- **Testing Responsibilities:**
  - Validate that `src/analytics/engine.py` outputs correct counts matching the raw dataset.

---

### Member 2 (M2): NLP & Text Preprocessing Developer
- **Role:** NLP / Text Preprocessing Developer (Pair 1)
- **Assigned Code & Files:**
  - `src/nlp/preprocessor.py`
  - `src/nlp/__init__.py`
  - `tests/test_nlp.py`
- **Required Skills:** Python standard library (`re` module), string manipulation, NLTK stopword concepts.
- **Learning Requirements:** Regular expressions for text sanitization, tokenization strategies, stopword list customization, and negation preservation techniques.
- **Concrete Tasks & Deliverables:**
  1. Build `clean_text(text: str) -> str`: lowercasing, whitespace stripping, URL masking (`<URL>`), currency/number masking (`<NUM>`, `<CURR>`), punctuation removal.
  2. Implement stopword removal while explicitly retaining negation tokens (`not`, `no`, `never`, `neither`, `nor`, `cannot`).
  3. Create comprehensive unit tests in `tests/test_nlp.py` covering standard text, emoji text, pure numbers, and empty strings.
  4. Ensure zero external web requests are made during runtime text cleaning.
- **Dependencies:** None. Can start immediately using sample SMS strings.
- **Handovers:**
  - Hands tested, importable `clean_text()` and `tokenize()` functions to **M3 (ML)** for training and **M4 (Backend)** for inference.
- **Testing Responsibilities:**
  - 100% unit test pass rate on `tests/test_nlp.py` using Pytest.

---

### Member 3 (M3): Machine Learning Developer
- **Role:** Machine Learning Developer (Pair 1)
- **Assigned Code & Files:**
  - `src/models/train.py`
  - `src/models/predict.py`
  - `src/models/evaluate.py`
  - `models/model_pipeline.joblib`
  - `models/metrics_summary.json`
  - `tests/test_models.py`
- **Required Skills:** Scikit-learn, TF-IDF vectorization, Naive Bayes, Logistic Regression, model evaluation metrics.
- **Learning Requirements:** Stratified train-test splitting, data leakage prevention, probability thresholding, and Joblib serialization.
- **Concrete Tasks & Deliverables:**
  1. Build `src/models/train.py` to train `TfidfVectorizer` and `MultinomialNB` on stratified 80/20 train-test split.
  2. Train `LogisticRegression` as a comparative benchmark model.
  3. Generate evaluation metrics (Precision, Recall, F1-Score, Confusion Matrix) and save to `models/metrics_summary.json`.
  4. Serialize champion pipeline to `models/model_pipeline.joblib`.
  5. Implement `predict_message(model, text: str) -> dict` in `src/models/predict.py`.
  6. Write automated tests in `tests/test_models.py` ensuring model loads correctly and outputs valid probabilities ($0.0 \le p \le 1.0$).
- **Dependencies:** Requires `src/nlp/preprocessor.py` from M2 and raw dataset from M1.
- **Handovers:**
  - Hands `models/model_pipeline.joblib` and `src/models/predict.py` to **M4 (Backend)** for API integration.
  - Hands `models/metrics_summary.json` to **M1 (Lead)** and **M4** for analytics display.
- **Testing Responsibilities:**
  - Test model deserialization, input validation, and assert F1-Score $\ge 0.90$ on test set in `tests/test_models.py`.

---

### Member 4 (M4): Backend Developer
- **Role:** Backend Developer (Pair 2)
- **Assigned Code & Files:**
  - `app.py`
  - `src/api/routes.py`
  - `src/utils/validators.py`
  - `src/utils/file_handlers.py`
  - `tests/test_api.py`
- **Required Skills:** Python, Flask, HTTP protocol, RESTful JSON APIs, file uploads, Pytest Flask client.
- **Learning Requirements:** Flask blueprints, error handling middleware, multipart file streaming, and MIME type validation.
- **Concrete Tasks & Deliverables:**
  1. Configure Flask application factory and serve root HTML template.
  2. Implement `GET /api/health` verifying server and model readiness.
  3. Implement `POST /api/predict` receiving JSON and returning classification label and confidence.
  4. Implement `POST /api/bulk-predict` parsing uploaded CSV, validating size ($\le 5\text{ MB}$), running batch inference, and generating preview.
  5. Implement `GET /api/download/<file_id>` for streaming annotated CSV results.
  6. Connect `GET /api/analytics` to serve dataset and model metrics.
  7. Write integration tests in `tests/test_api.py` covering success and failure HTTP status codes.
- **Dependencies:** Requires `src/nlp/` from M2, `src/models/` from M3, and `src/analytics/` from M1.
- **Handovers:**
  - Hands running Flask server and verified API endpoints to **M5 (Frontend)** for UI connection.
- **Testing Responsibilities:**
  - Automated tests for all routes (valid inputs, empty inputs, bad file types, oversized files) in `tests/test_api.py`.

---

### Member 5 (M5): Frontend Developer
- **Role:** Frontend Developer (Pair 2)
- **Assigned Code & Files:**
  - `templates/index.html`
  - `static/css/style.css`
  - `static/js/app.js`
  - `static/js/charts.js`
  - `static/img/`
- **Required Skills:** Semantic HTML5, Modern CSS (Flexbox/Grid), Vanilla JavaScript (ES6+ `fetch`, DOM manipulation), Chart.js.
- **Learning Requirements:** Client-side asynchronous API handling, error banner presentation, drag-and-drop file upload UX, and Chart.js responsive canvas configuration.
- **Concrete Tasks & Deliverables:**
  1. Author accessible, modern Single-Page Application layout in `templates/index.html`.
  2. Create custom CSS theme in `static/css/style.css` with responsive breakpoints for mobile and desktop.
  3. Implement single SMS submission form with dynamic result badge (green for Ham, red for Spam) and preprocessed text display in `static/js/app.js`.
  4. Implement CSV file upload drop-zone, upload progress indicator, results summary, and preview table.
  5. Wire "Download Results CSV" button to trigger file download.
  6. Implement Chart.js visualizations (Class distribution doughnut chart, message length bar chart) in `static/js/charts.js`.
- **Dependencies:** Consumes API contracts specified in `docs/08-api-contracts.md` provided by M4.
- **Handovers:**
  - Hands completed, tested user interface to **M1 (Lead)** and **All Members** for final end-to-end integration review.
- **Testing Responsibilities:**
  - Manual browser testing across Chrome, Firefox, and Edge. Responsive design verification on mobile viewports. Cross-Site Scripting (XSS) input safety checks.

---

## 3. Responsibility & Handoff Summary Table

| Deliverable Item | Primary Owner | Reviewer / Consumer | Handoff Condition | Target Day |
| :--- | :--- | :--- | :--- | :--- |
| **Verified Dataset & EDA** | M1 | M2, M3 | Raw data confirmed in `data/raw/` with zero missing values | Day 2 |
| **Text Preprocessor Module** | M2 | M3, M4 | Passes all unit tests in `tests/test_nlp.py` | Day 3 |
| **Trained ML Pipeline** | M3 | M4 | Serialized to `models/` with F1-Score $\ge 0.90$ on test split | Day 5 |
| **Flask API Endpoints** | M4 | M5 | Returns expected JSON matching `docs/08-api-contracts.md` | Day 8 |
| **Dashboard UI & Charts** | M5 | All | Interactive forms submit, render badges, and draw charts | Day 11 |
| **Automated Test Suite** | M2, M3, M4 | M1 | `pytest tests/` runs with 100% pass rate | Day 15 |
| **Academic Report & Slides**| M1 (Lead) | All | Complete 20-page report and 15-slide defense presentation | Day 17 |
