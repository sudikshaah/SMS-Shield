# SMS Shield: SMS Text Cleaning and Classification System

> **Academic Project ID:** NLP-04  
> **Domain:** Natural Language Processing (NLP), Machine Learning, Web Development  
> **Target Audience:** Academic evaluation panel, B.Tech CSE project reviewers, and development team members  
> **Status:** Architecture & Documentation Baseline Established (`PROPOSED` for implementation)

---

## 1. Project Overview

**SMS Shield** is an end-to-end Machine Learning and Natural Language Processing web application designed to automatically inspect, clean, and classify Short Message Service (SMS) text messages as either **HAM** (legitimate, non-spam) or **SPAM** (unsolicited, fraudulent, or malicious).

Developed as an academic software engineering project by a 5-member undergraduate B.Tech Computer Science and Engineering team, SMS Shield provides:
1. **Interactive Single SMS Classification:** Real-time text preprocessing, spam likelihood scoring, and rule/model-based classification.
2. **Batch / Bulk SMS Processing:** Upload a CSV file of messages, execute batched NLP preprocessing and model inference, view summary metrics, and download the annotated dataset.
3. **Exploratory & Prediction Analytics:** Visualizations of class balance, message lengths, vocabulary distributions, and inference metrics using Chart.js.
4. **Model Performance Insights:** Transparent evaluation metrics (Precision, Recall, F1-Score, Confusion Matrix) demonstrating explainability and comparative machine learning rigor.

---

## 2. Problem Statement

Mobile SMS remains a high-trust communication channel worldwide. However, unsolicited promotional campaigns, smishing (SMS phishing), lottery scams, and impersonation fraud present severe security risks to everyday mobile users. Because SMS messages are constrained in length (traditionally 160 characters) and feature heavy colloquialisms, non-standard spelling, abbreviations, emojis, and obscured hyperlinks, traditional keyword blocklists fail.

SMS Shield solves this problem by building a reproducible, transparent machine learning pipeline that cleans noisy SMS text, extracts meaningful statistical and semantic features via TF-IDF (Term Frequency-Inverse Document Frequency), and delivers robust classification through probabilistic models (Multinomial Naive Bayes) and linear discriminants (Logistic Regression).

---

## 3. Key Features

| Category | Feature | Description | Status |
| :--- | :--- | :--- | :--- |
| **NLP Preprocessing** | Custom Cleaning Pipeline | Normalization, URL tokenization/scrubbing, special symbol filtering, whitespace stripping, and negation preservation (`not`, `never`, `no`). | `PROPOSED` |
| **Machine Learning** | Supervised Text Classification | Multinomial Naive Bayes (primary baseline) and Logistic Regression comparison trained on the validated SMS Spam Collection dataset. | `PROPOSED` |
| **Web Interface** | Single SMS Triage | Clean input box with instant classification feedback, class badge (`HAM` or `SPAM`), and probability confidence score. | `PROPOSED` |
| **Batch Processing** | Bulk CSV Classification | Upload `.csv` file containing SMS messages, perform pipeline inference across all rows, view preview, and export result CSV. | `PROPOSED` |
| **Data Analytics** | Visual Dashboards | Interactive Chart.js charts showing corpus ham-to-spam ratio, message length distributions, and classification summaries. | `PROPOSED` |
| **Evaluation Panel** | Transparent Metrics | In-app display of precision, recall, F1-score, and confusion matrix comparing candidate models. | `PROPOSED` |

---

## 4. Technology Stack

SMS Shield is engineered using lightweight, robust, and academic-friendly technologies to eliminate unnecessary deployment and configuration overhead:

- **Programming Language:** Python 3.10+
- **Data Manipulation & NLP:** Pandas, NumPy, Scikit-learn, Python Standard Library Regex (`re`), NLTK (selective stopword lists)
- **Machine Learning & Persistence:** Scikit-learn (`MultinomialNB`, `LogisticRegression`, `TfidfVectorizer`), Joblib (model artifact persistence)
- **Web Application Backend:** Flask (Lightweight REST-style JSON APIs and static asset serving)
- **Frontend Dashboard:** Semantic HTML5, CSS3 (Modern Flexbox/Grid), Vanilla JavaScript (ES6+), Chart.js
- **Testing & Quality Assurance:** Pytest, Scikit-learn classification reporting, manual API test cases

*Architectural Boundary Note:* Complex infrastructure such as React, Docker, Kubernetes, Redis, or external databases (MongoDB/PostgreSQL) are deliberately excluded to prioritize code quality, explainability, and maintainability within the 2–3 week academic development timeline.

---

## 5. System Architecture Overview

```
                   +---------------------------------------------+
                   |           User Web Browser (Client)         |
                   |   - HTML5 / CSS3 Responsive Dashboard       |
                   |   - Vanilla JS Client Controller            |
                   |   - Chart.js Dynamic Visualizations         |
                   +----------------------+----------------------+
                                          |
                                          | HTTP / JSON REST APIs
                                          v
                   +---------------------------------------------+
                   |             Flask Web Application           |
                   |  - Route Handling & Static File Serving     |
                   |  - API Request Validation & Security Limits |
                   |  - Error Handlers & HTTP Status Protocol    |
                   +----------------------+----------------------+
                                          |
                      +-------------------+-------------------+
                      |                                       |
                      v                                       v
         +-------------------------+             +-------------------------+
         |   NLP Preprocessor      |             |     Analytics Engine    |
         |  - URL scrubbing        |             |  - Dataset EDA metrics  |
         |  - Lowercasing          |             |  - Char/Word statistics |
         |  - Negation retention   |             |  - Summary distributions|
         |  - Tokenization         |             +-------------------------+
         +------------+------------+
                      |
                      v
         +-------------------------+
         | ML Inference Pipeline   |
         |  - Fitted TF-IDF Model  |
         |  - Trained Classifier   |
         |  - Confidence Scorer    |
         |  (Loaded via Joblib)    |
         +-------------------------+
```

---

## 6. Team Structure & Responsibilities

The project is executed by a team of 5 undergraduate engineers divided into focused pairs led by a project coordinator:

| Role ID | Team Member Role | Focus Area & Concrete Deliverables | Assigned Directory / Files |
| :--- | :--- | :--- | :--- |
| **M1** | **Project Lead & Data Analytics** | Overall repo coordination, EDA notebook, dataset acquisition & validation, analytics module (`analytics.py`), project report and viva slides. | `src/analytics/`, `notebooks/`, documentation |
| **M2** | **NLP & Preprocessing Developer** | Regex cleaning pipeline, URL normalization, negation preservation, stopword filtering, unit tests for preprocessor. | `src/nlp/`, `tests/test_nlp.py` |
| **M3** | **Machine Learning Developer** | Train-test split, TF-IDF vectorizer configuration, model training (`MultinomialNB`, `LogisticRegression`), model comparison, evaluation reports, pipeline saving. | `src/models/`, `tests/test_models.py` |
| **M4** | **Backend Developer** | Flask application setup, REST API endpoints (`/api/predict`, `/api/bulk-predict`, `/api/analytics`, `/api/health`), CSV validation, error handling. | `src/api/`, `app.py`, `tests/test_api.py` |
| **M5** | **Frontend Developer** | Semantic UI markup, modern CSS styling, client-side fetch calls, dynamic DOM rendering, Chart.js integrations, responsive design. | `static/`, `templates/` |

---

## 7. Repository Structure

```
AI-proj-3rd-sem/
├── .gitignore                     # Git ignore rules for virtual environments, caches, models
├── README.md                      # High-level project entry point (this file)
├── AGENTS.md                      # Single source of truth & rules for AI coding assistants
├── requirements.txt               # Pinned Python package dependencies
├── app.py                         # Application entrypoint (Flask server)
├── data/                          # Dataset directory (local & untracked)
│   ├── raw/                       # Raw downloaded datasets (UCI SMS Collection)
│   └── processed/                 # Cleaned, tokenized intermediate data files
├── docs/                          # Comprehensive technical documentation system
│   ├── 01-project-overview.md     # In-depth project background and problem scope
│   ├── 02-prd.md                  # Formal Product Requirements Document
│   ├── 03-feature-specification.md# Detailed feature input/output/edge case specifications
│   ├── 04-system-architecture.md  # End-to-end architectural blueprints and dataflows
│   ├── 05-tech-stack.md           # Rationale and versions for technology choices
│   ├── 06-project-structure.md    # Codebase hierarchy and file ownership mapping
│   ├── 07-data-models.md          # Schemas, in-memory representations, and API payloads
│   ├── 08-api-contracts.md        # Explicit REST API contracts and schema examples
│   ├── 09-development-roadmap.md  # Realistic 18-day schedule and milestones
│   ├── 10-team-responsibilities.md# Member-by-member task matrix and handoffs
│   ├── 11-agent-workflows.md      # AI agent operating protocols per developer role
│   ├── 12-github-workflow.md      # Branching, pull requests, commit conventions, DoD
│   ├── 13-testing-strategy.md     # Unit, integration, and ML validation protocols
│   ├── 14-security-and-privacy.md # Input sanitization, file limits, safe deserialization
│   ├── 15-viva-preparation.md     # Academic viva defense questions and model answers
│   ├── 16-glossary.md             # Beginner-friendly definitions of core concepts
│   └── 17-decisions-and-assumptions.md # Architecture Decision Records (ADRs) and assumptions
├── models/                        # Serialized ML model and vectorizer artifacts (.joblib)
├── notebooks/                     # Jupyter notebooks for EDA and model experiments
├── src/                           # Application core source code
│   ├── __init__.py
│   ├── AGENTS.md                  # Scoped AI developer guidelines for backend & ML source
│   ├── api/                       # Flask routes and blueprint definitions
│   ├── analytics/                 # EDA metrics computation and corpus statistics
│   ├── nlp/                       # Text cleaning, normalization, and tokenization modules
│   ├── models/                    # Model training, vectorization, and evaluation logic
│   └── utils/                     # Common helpers (file validation, response builders)
├── static/                        # Frontend client assets
│   ├── css/                       # Modular CSS stylesheets
│   ├── js/                        # Vanilla JS modules (API client, UI logic, charts)
│   └── img/                       # Icons and visual assets
├── templates/                     # Flask HTML templates
│   └── index.html                 # Single-page dashboard application template
└── tests/                         # Automated test suite (Pytest)
    ├── AGENTS.md                  # Testing guidelines and verification rules
    ├── test_nlp.py                # Preprocessor and regex unit tests
    ├── test_models.py             # Model training and inference unit tests
    └── test_api.py                # Flask route and payload integration tests
```

---

## 8. Installation and Setup Guide

### 8.1 Prerequisites
- Python 3.10, 3.11, 3.12, or 3.13 installed on your machine.
- Git installed (optional but strongly recommended for team collaboration).

### 8.2 Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/AI-proj-3rd-sem.git
   cd AI-proj-3rd-sem
   ```

2. **Create and activate a Python virtual environment:**
   - *Windows (PowerShell):*
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - *Linux / macOS:*
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Verify environment installation:**
   ```bash
   pytest tests/
   ```

5. **Run the local development server:**
   ```bash
   python app.py
   ```
   Open your browser and navigate to `http://127.0.0.1:5000/`.

---

## 9. Documentation Directory Map

To explore the detailed design, team responsibilities, and technical standards, refer to the documents in `docs/`:

1. [Project Overview](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/docs/01-project-overview.md) - Background, problem context, and objectives.
2. [Product Requirements Document (PRD)](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/docs/02-prd.md) - Personas, user stories, and acceptance criteria.
3. [Feature Specifications](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/docs/03-feature-specification.md) - Edge cases, inputs, and outputs for all features.
4. [System Architecture](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/docs/04-system-architecture.md) - Component interaction diagrams and data flows.
5. [Tech Stack Rationale](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/docs/05-tech-stack.md) - Justification and versioning for selected libraries.
6. [Project Structure](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/docs/06-project-structure.md) - Detailed file tree and code ownership.
7. [Data Models & Schemas](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/docs/07-data-models.md) - Dataset, in-memory, and API structures.
8. [API Contracts](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/docs/08-api-contracts.md) - REST API request and response specifications.
9. [Development Roadmap](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/docs/09-development-roadmap.md) - 18-day phased delivery schedule.
10. [Team Responsibilities](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/docs/10-team-responsibilities.md) - Roles, handoffs, and deliverable matrix.
11. [Agent Workflows](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/docs/11-agent-workflows.md) - Protocols for AI coding assistants working on the project.
12. [GitHub Workflow](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/docs/12-github-workflow.md) - Git branch strategy, PR checklist, and DoD.
13. [Testing Strategy](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/docs/13-testing-strategy.md) - Pytest suite structure and ML evaluation methodology.
14. [Security & Privacy](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/docs/14-security-and-privacy.md) - Input limits, file validation, and safe deserialization.
15. [Viva Preparation](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/docs/15-viva-preparation.md) - Sample academic viva questions and technical explanations.
16. [Glossary](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/docs/16-glossary.md) - Clear explanations of key NLP and ML terminology.
17. [Decisions & Assumptions](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/docs/17-decisions-and-assumptions.md) - Confirmed vs. proposed architectural choices.

---

## 10. AI Coding Agent Guidelines

All AI coding assistants (Gemini, Claude, ChatGPT, GitHub Copilot) operating within this repository must strictly obey the anti-hallucination protocols defined in [AGENTS.md](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/AGENTS.md). Crucially:
- Inspect existing files before proposing or writing code.
- Never invent completed features, test outputs, or dataset statistics.
- Never alter API contracts or shared preprocessing logic without explicit approval from Project Lead (M1).
