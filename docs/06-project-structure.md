# 06. Project Directory and File Structure

> **Document Status:** `PROPOSED` Baseline  
> **Project ID:** NLP-04  
> **Product Working Title:** SMS Shield  
> **Lead Author:** M1 (Project Lead)  
> **Contributors:** M2, M3, M4, M5

---

## 1. Directory Tree Overview

Below is the definitive directory and file tree for SMS Shield. Every file has an assigned owner, strict purpose, and designated lifecycle.

```text
AI-proj-3rd-sem/
├── .gitignore                         # Git exclusion rules (venv, *.joblib, data/raw, pycache)
├── README.md                          # Primary repository documentation and onboarding
├── AGENTS.md                          # Repository-level rules of engagement for AI coding agents
├── requirements.txt                   # Pinned Python package dependencies
├── app.py                             # Flask application entry point and server startup
│
├── data/                              # Data storage directory (Ignored by Git except .gitkeep)
│   ├── raw/                           # Raw downloaded SMS datasets (e.g., SMSSpamCollection)
│   ├── processed/                     # Cleaned, tokenized CSV/parquet representations
│   └── temp_bulk/                     # Ephemeral folder for user-uploaded batch CSVs
│
├── docs/                              # Comprehensive technical documentation system
│   ├── 01-project-overview.md         # Problem definition, scope, and objectives
│   ├── 02-prd.md                      # Product Requirements Document & user stories
│   ├── 03-feature-specification.md    # Detailed feature specifications & edge cases
│   ├── 04-system-architecture.md      # Mermaid diagrams, component roles & dataflows
│   ├── 05-tech-stack.md               # Technology selections, rationales & versions
│   ├── 06-project-structure.md        # File hierarchy and ownership mapping (this file)
│   ├── 07-data-models.md              # Schemas, in-memory structures & API formats
│   ├── 08-api-contracts.md            # HTTP REST API endpoint specifications
│   ├── 09-development-roadmap.md      # 18-day development timeline & milestones
│   ├── 10-team-responsibilities.md    # RACI matrix and member delivery scopes
│   ├── 11-agent-workflows.md          # Role-specific AI agent operational guidelines
│   ├── 12-github-workflow.md          # Branching, commits, pull requests & code review
│   ├── 13-testing-strategy.md         # Pytest test plan, fixtures & evaluation methodology
│   ├── 14-security-and-privacy.md     # Input sanitization, file limits & secure models
│   ├── 15-viva-preparation.md         # Sample viva examination questions & answers
│   ├── 16-glossary.md                 # Definitions of core NLP and ML concepts
│   └── 17-decisions-and-assumptions.md# Architecture Decision Records (ADR)
│
├── models/                            # Serialized ML artifacts (Ignored or tracked via LFS)
│   ├── .gitkeep                       # Keeps folder tracked in git
│   ├── model_pipeline.joblib          # Trained vectorizer + classifier pipeline bundle
│   └── metrics_summary.json           # Serialized model evaluation metrics (accuracy, F1, etc.)
│
├── notebooks/                         # Exploratory and experimental Jupyter notebooks
│   └── 01_eda_and_prototyping.ipynb   # Exploratory Data Analysis & initial ML benchmarks
│
├── src/                               # Application source code
│   ├── __init__.py                    # Makes src a Python package
│   ├── AGENTS.md                      # Scoped AI developer rules for src/
│   │
│   ├── analytics/                     # Dataset statistics and corpus analytics
│   │   ├── __init__.py
│   │   └── engine.py                  # Class distribution, text length metrics, vocabulary stats
│   │
│   ├── api/                           # Flask routing and API controllers
│   │   ├── __init__.py
│   │   └── routes.py                  # REST API blueprints (/api/predict, /api/bulk-predict, etc.)
│   │
│   ├── models/                        # ML pipeline training, prediction, and evaluation
│   │   ├── __init__.py
│   │   ├── train.py                   # Offline script to train, evaluate, and save pipeline
│   │   ├── predict.py                 # Inference helper functions
│   │   └── evaluate.py                # Computes Precision, Recall, F1, and Confusion Matrix
│   │
│   ├── nlp/                           # Text preprocessing and tokenization
│   │   ├── __init__.py
│   │   └── preprocessor.py            # Regex cleaning, URL masking, negation preservation
│   │
│   └── utils/                         # Reusable cross-cutting utility functions
│       ├── __init__.py
│       ├── file_handlers.py           # Safe CSV reading, chunking, and temp file management
│       └── validators.py              # String, length, and MIME type validation
│
├── static/                            # Client-side static assets
│   ├── css/
│   │   └── style.css                  # Modern, responsive CSS styling
│   ├── js/
│   │   ├── app.js                     # Main client logic: event listeners, fetch calls, DOM
│   │   └── charts.js                  # Chart.js initialization and dynamic updates
│   └── img/
│       └── logo.svg                   # Application logo and icons
│
├── templates/                         # Server-rendered HTML templates
│   └── index.html                     # Main dashboard view (Single-Page UI)
│
└── tests/                             # Automated test suite
    ├── __init__.py
    ├── AGENTS.md                      # Scoped AI developer rules for tests/
    ├── conftest.py                    # Pytest fixtures (sample SMS, test client, mock models)
    ├── test_nlp.py                    # Unit tests for text cleaning and regex rules
    ├── test_models.py                 # Unit tests for training, evaluation, and pipeline inference
    └── test_api.py                    # Integration tests for Flask endpoints and file upload
```

---

## 2. File Ownership and Deliverable Mapping

| File Path | Owner | Purpose & Contents | Primary Consumers |
| :--- | :--- | :--- | :--- |
| `app.py` | **M4 (Backend)** | Flask app factory, configuration loading, error handlers, and server bootstrap. | End-users, dev server |
| `src/nlp/preprocessor.py` | **M2 (NLP)** | Pure Python text cleaning logic (`clean_text()`, `tokenize()`). | M3 (Training), M4 (Inference) |
| `src/models/train.py` | **M3 (ML)** | Script for training vectorizer & classifier, generating `models/model_pipeline.joblib`. | M3, CI scripts |
| `src/models/predict.py` | **M3 (ML)** | Wrapper function `predict_message(model, text)` returning label and probabilities. | M4 (`src/api/routes.py`) |
| `src/models/evaluate.py` | **M3 (ML)** | Generates `models/metrics_summary.json` containing precision, recall, F1, and confusion matrix. | M1 (Analytics), M4 (API) |
| `src/analytics/engine.py` | **M1 (Lead)** | Computes corpus stats and aggregation summaries for dashboard display. | M4 (`/api/analytics`) |
| `src/api/routes.py` | **M4 (Backend)** | Defines Flask API endpoints, integrates `preprocessor`, `predict`, and `analytics`. | M5 (Frontend JS) |
| `src/utils/validators.py` | **M4 (Backend)** | Validates text strings, CSV extensions, and maximum file size thresholds. | `src/api/routes.py` |
| `templates/index.html` | **M5 (Frontend)** | Semantic layout containing Single SMS tab, Bulk CSV tab, and Analytics tab. | Web browser |
| `static/css/style.css` | **M5 (Frontend)** | CSS styling, color schemes (green for ham, red for spam), responsive layout. | Web browser |
| `static/js/app.js` | **M5 (Frontend)** | Frontend event handlers, `fetch()` calls to Flask API, table preview rendering. | Web browser |
| `static/js/charts.js` | **M5 (Frontend)** | Functions to render and update Chart.js instances (Pie charts, Bar charts). | Web browser |
| `tests/test_nlp.py` | **M2 (NLP)** | Pytest test cases covering all edge cases of text preprocessing. | Pytest test runner |
| `tests/test_models.py` | **M3 (ML)** | Pytest test cases validating model serialization and inference predictions. | Pytest test runner |
| `tests/test_api.py` | **M4 (Backend)** | Pytest test cases testing all HTTP endpoints with valid and invalid payloads. | Pytest test runner |
