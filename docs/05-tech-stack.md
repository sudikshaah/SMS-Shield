# 05. Technology Stack Rationale & Specifications

> **Document Status:** `PROPOSED` Baseline  
> **Project ID:** NLP-04  
> **Product Working Title:** SMS Shield  
> **Lead Author:** M1 (Project Lead)  
> **Reviewed By:** M2, M3, M4, M5

---

## 1. Overview of Technology Stack

SMS Shield deliberately chooses a focused, robust, and beginner-friendly technology stack. Each technology is selected based on three criteria:
1. **Academic Appropriateness:** Transparent and standard in undergraduate CSE curricula.
2. **Implementation Velocity:** Enables a 5-student team to ship a working MVP within 2–3 weeks.
3. **Zero Inessential Bloat:** Avoids complex tooling (e.g., Docker, Kubernetes, React, Redis, MongoDB) that does not add core value to text classification.

---

## 2. Technology Inventory & Ownership Matrix

| Technology | Category | Why It Is Needed | Where It Is Used | Owner | Status | Package / Version |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Python** | Runtime Language | Primary language for data science, NLP, and rapid API development. | Core language across all modules. | All | **Mandatory** | `>= 3.10` |
| **Pandas** | Data Processing | High-performance tabular data structures, CSV parsing, exploratory data analysis. | `notebooks/`, `src/analytics/`, batch CSV handling in `src/api/`. | M1 & M4 | **Mandatory** | `>= 2.0.0` |
| **NumPy** | Numerical Math | Array operations, matrix representations, statistical aggregations. | Underlying dependencies for Pandas and Scikit-learn. | M1 & M3 | **Mandatory** | `>= 1.24.0` |
| **Scikit-learn** | Machine Learning | TF-IDF vectorization, Multinomial Naive Bayes, Logistic Regression, train-test splitting, metrics calculation. | `src/models/`, feature extraction, inference pipeline. | M3 | **Mandatory** | `>= 1.3.0` |
| **Joblib** | Serialization | Efficient serialization and loading of Python objects containing large NumPy arrays and Scikit-learn models. | `models/` saving and loading in `app.py`. | M3 & M4 | **Mandatory** | `>= 1.3.0` |
| **Python `re` (Regex)** | Text Cleaning | Pattern matching for URLs, telephone numbers, currency symbols, and non-alphanumeric noise. | `src/nlp/preprocessor.py`. | M2 | **Mandatory** | Standard Library |
| **NLTK (Selective)** | NLP Utility | Providing curated, standard English stopword lists. | `src/nlp/preprocessor.py` (stopword set only). | M2 | **Mandatory** | `>= 3.8.1` |
| **Flask** | Web Framework | Minimal, un-opinionated Python web server for serving HTML and JSON REST APIs. | `app.py`, `src/api/`. | M4 | **Mandatory** | `>= 3.0.0` |
| **HTML5 / CSS3** | Presentation Tier | Clean semantic markup and responsive styling without complex UI frameworks. | `templates/`, `static/css/`. | M5 | **Mandatory** | W3C Standard |
| **Vanilla JavaScript (ES6+)** | Frontend Logic | Event handling, asynchronous `fetch` calls, DOM updates, and Chart.js instantiation. | `static/js/app.js`. | M5 | **Mandatory** | ECMAScript 2020+ |
| **Chart.js** | Visual Analytics | Lightweight, responsive HTML5 canvas charting library for rendering pie/bar charts. | `static/js/`, `templates/index.html`. | M5 & M1 | **Mandatory** | `^4.4.0` (via CDN or local) |
| **Pytest** | Testing Framework | Expressive, readable unit and integration test runner for verification. | `tests/` directory. | M2, M3, M4 | **Mandatory** | `>= 7.4.0` |
| **Jupyter Notebook** | Research & EDA | Interactive scratchpad for exploratory data analysis and model prototyping. | `notebooks/eda.ipynb`. | M1 | **Optional** | `>= 7.0.0` |

---

## 3. Technology Rationale & Comparative Evaluation

### 3.1 Web Framework: Flask vs. FastAPI vs. Django
- **Selected: Flask**
- *Reasoning:*
  - Django is heavyweight and includes an ORM, admin panel, and session management that are completely unnecessary for a stateless text classification app.
  - FastAPI is modern and async-friendly, but requires learning Pydantic models, async loops, and ASGI servers (Uvicorn), which introduces unneeded friction for beginner students.
  - Flask is lightweight, taught in standard computer science courses, and can serve both static HTML templates and JSON endpoints with under 50 lines of boilerplate.

### 3.2 Frontend: Vanilla HTML/CSS/JS vs. React
- **Selected: Semantic HTML5, Modern CSS, and Vanilla JavaScript**
- *Reasoning:*
  - React requires Node.js, npm/yarn, Webpack/Vite build steps, complex state management, and CORS configuration when interacting with a local Flask server.
  - A responsive single-page dashboard can be built with standard HTML5 and Vanilla JS `fetch()` without any build tools, making the project instantly cloneable and runnable via `python app.py`.

### 3.3 Text Representation: TF-IDF vs. Word2Vec / BERT
- **Selected: TF-IDF (Term Frequency - Inverse Document Frequency)**
- *Reasoning:*
  - Pretrained Transformer models (BERT, RoBERTa) require substantial disk space (400MB+ per model), GPU acceleration for fast inference, and complex PyTorch/HuggingFace dependencies.
  - TF-IDF with n-grams (1-gram and 2-gram) is exceptionally fast, highly explainable for academic defense (each word has an explicit weight), and achieves $>97\%$ accuracy on standard SMS spam benchmarks with near-zero latency.

### 3.4 Classifiers: Multinomial Naive Bayes & Logistic Regression
- **Selected: MultinomialNB and LogisticRegression**
- *Reasoning:*
  - **Multinomial Naive Bayes:** The textbook standard for bag-of-words text classification. Based on Bayes' Theorem with conditional independence assumptions, it performs remarkably well even on small datasets.
  - **Logistic Regression:** Provides smooth probability estimation ($P(\text{Spam} \mid \text{text})$) via the sigmoid function, allowing threshold calibration and feature importance inspection via model coefficients.

---

## 4. Environment and Dependency Management

All required Python packages are pinned in `requirements.txt`:

```text
flask>=3.0.0
scikit-learn>=1.3.0
pandas>=2.0.0
numpy>=1.24.0
joblib>=1.3.0
nltk>=3.8.1
pytest>=7.4.0
```

Installation is performed in a clean virtual environment:
```bash
python -m venv venv
# Linux/macOS:
source venv/bin/activate
# Windows:
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```
