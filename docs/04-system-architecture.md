# 04. System Architecture & Workflows

> **Document Status:** `PROPOSED` Baseline  
> **Project ID:** NLP-04  
> **Product Working Title:** SMS Shield  
> **Architect:** M1 (Project Lead)  
> **Reviewed By:** M2, M3, M4, M5

---

## 1. High-Level System Architecture

SMS Shield is structured as a decoupled, modular three-tier architecture:
1. **Presentation Tier (Client):** Responsive Single-Page Application (SPA) dashboard built with Semantic HTML5, CSS3, Vanilla ES6 JavaScript, and Chart.js.
2. **Application Tier (Backend Service):** Flask application providing RESTful API endpoints, request routing, payload validation, and data orchestration.
3. **Machine Learning & NLP Tier (Core Engine):** Decoupled Python modules responsible for text preprocessing, TF-IDF feature extraction, model inference, and statistical analytics.

```mermaid
graph TD
    subgraph Presentation Tier [Client Browser]
        UI[User Interface - HTML5/CSS3]
        ClientController[Vanilla JS Controller]
        ChartEngine[Chart.js Visualizer]
    end

    subgraph Application Tier [Flask Web Service]
        Router[Flask Route Handler / Blueprint]
        Validator[Input & CSV Validator]
        ResponseFormatter[JSON & File Stream Formatter]
    end

    subgraph ML & NLP Engine [Core Processing Logic]
        Preprocessor[src.nlp.preprocessor]
        TFIDF[Fitted TfidfVectorizer]
        Classifier[Trained Classifier - MNB / LR]
        AnalyticsEngine[src.analytics.engine]
    end

    subgraph Storage & Artifacts [Local Filesystem]
        ModelArtifacts[(models/*.joblib)]
        DatasetFiles[(data/raw & data/processed)]
        TempUploads[(data/temp_bulk/)]
    end

    %% Interactions
    UI -->|DOM Events| ClientController
    ClientController -->|HTTP POST /api/predict| Router
    ClientController -->|HTTP POST /api/bulk-predict| Router
    ClientController -->|HTTP GET /api/analytics| Router
    Router --> Validator
    Validator -->|Cleaned Text Request| Preprocessor
    Validator -->|Parsed DataFrame| Preprocessor
    Preprocessor -->|Clean Tokens| TFIDF
    TFIDF -->|Sparse Feature Matrix| Classifier
    Classifier -->|Predicted Probabilities| ResponseFormatter
    Router --> AnalyticsEngine
    AnalyticsEngine -->|Corpus Metrics| ResponseFormatter
    ResponseFormatter -->|JSON Response| ClientController
    ClientController -->|Render Charts| ChartEngine
    ClientController -->|Update DOM| UI

    %% Disk Access
    ModelArtifacts -.->|Loaded on Startup via Joblib| Classifier
    ModelArtifacts -.->|Loaded on Startup via Joblib| TFIDF
    DatasetFiles -.->|EDA & Offline Training| AnalyticsEngine
    Router -.->|Save / Stream CSV| TempUploads
```

---

## 2. Component Responsibilities

| Component | Module Path | Primary Responsibility | Owned By |
| :--- | :--- | :--- | :--- |
| **Web Server & Routing** | `app.py`, `src/api/routes.py` | Initializes Flask app, serves HTML templates, maps endpoints, handles global HTTP errors. | **M4 (Backend)** |
| **Request & File Validation** | `src/utils/validators.py` | Sanitizes string inputs, checks MIME types and file size boundaries, prevents path traversal. | **M4 (Backend)** |
| **Text Preprocessing** | `src/nlp/preprocessor.py` | Executes regex scrubbing, URL masking, lowercasing, negation preservation, and stopword filtering. | **M2 (NLP)** |
| **Feature Extraction & ML** | `src/models/classifier.py` | Houses pipeline loading, vector transformation, class probability generation, and metrics evaluation. | **M3 (ML)** |
| **Model Persistence** | `src/models/train.py` | Offline script to execute stratified train-test split, fit vectorizer, train models, and serialize to `models/*.joblib`. | **M3 (ML)** |
| **Analytics Engine** | `src/analytics/engine.py` | Computes corpus-level metrics (class distribution, word lengths, n-gram frequencies) for dashboard display. | **M1 (Lead)** |
| **Client UI & Visuals** | `templates/index.html`, `static/js/app.js` | Captures user inputs, makes async fetch requests, handles loading spinners, and dynamically draws Chart.js graphs. | **M5 (Frontend)** |

---

## 3. End-to-End Workflows

### 3.1 Offline Training Workflow (Executed Prior to Web Deployment)
```mermaid
sequenceDiagram
    autonumber
    actor M3 as Machine Learning Developer (M3)
    participant Dataset as data/raw/SMSSpamCollection
    participant Preprocessor as src/nlp/preprocessor.py
    participant Pipeline as Sklearn Pipeline (TFIDF + MNB)
    participant Evaluator as Evaluation Reporter
    participant Disk as models/model_pipeline.joblib

    M3->>Dataset: Load raw SMS messages
    M3->>Preprocessor: Apply clean_text() across all records
    Preprocessor-->>M3: Return cleaned text series
    M3->>M3: Perform Stratified 80/20 Train-Test Split
    Note over M3,Pipeline: Fit vectorizer ONLY on training set!
    M3->>Pipeline: pipeline.fit(X_train, y_train)
    Pipeline-->>M3: Fitted Pipeline Object
    M3->>Evaluator: Evaluate on X_test (Precision, Recall, F1, Confusion Matrix)
    Evaluator-->>M3: Log test metrics
    M3->>Disk: joblib.dump(pipeline, "models/model_pipeline.joblib")
    Disk-->>M3: Model artifact serialized successfully
```

---

### 3.2 Single SMS Prediction Workflow (Runtime)
```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant JS as static/js/app.js
    participant Flask as src/api/routes.py
    participant Preprocessor as src/nlp/preprocessor.py
    participant Model as Loaded Pipeline (In-Memory)

    User->>JS: Enters text and clicks "Analyze SMS"
    JS->>JS: Validate input length > 0
    JS->>Flask: POST /api/predict { "text": "Win $1000 cash now!" }
    Flask->>Flask: Validate JSON payload format
    Flask->>Preprocessor: clean_text(text)
    Preprocessor-->>Flask: "win <CURR> cash now"
    Flask->>Model: pipeline.predict_proba(["win <CURR> cash now"])
    Model-->>Flask: P(Ham)=0.04, P(Spam)=0.96
    Flask->>Flask: Format label "SPAM", confidence 0.96
    Flask-->>JS: HTTP 200 { "label": "SPAM", "confidence": 0.96, "cleaned_text": "..." }
    JS->>User: Render Red "SPAM" Badge, 96% score, and tokens
```

---

### 3.3 Bulk CSV Processing Workflow (Runtime)
```mermaid
sequenceDiagram
    autonumber
    actor Analyst as User / Analyst
    participant JS as static/js/app.js
    participant Flask as src/api/routes.py
    participant Validator as src/utils/validators.py
    participant Engine as Batch Inference Engine
    participant Storage as Temp File Storage

    Analyst->>JS: Selects and drops "messages.csv"
    JS->>Flask: POST /api/bulk-predict (multipart/form-data)
    Flask->>Validator: Check file extension, size <= 5MB
    Validator-->>Flask: File valid
    Flask->>Engine: Read CSV into Pandas DataFrame
    Engine->>Engine: Locate text column & clean text via preprocessor
    Engine->>Engine: Run batch vectorization & model inference
    Engine->>Engine: Append 'predicted_label' & 'confidence'
    Engine->>Storage: Save annotated CSV to data/temp_bulk/uuid.csv
    Engine-->>Flask: Summary counts (Total, Ham, Spam) + Top 10 preview
    Flask-->>JS: HTTP 200 { summary, preview, download_url }
    JS->>Analyst: Display preview table, summary cards, and Chart.js pie chart
    Analyst->>Flask: GET /api/download/bulk-uuid.csv
    Flask-->>Analyst: Streams CSV file download
```

---

## 4. Key Architectural Decisions

1. **Integrated Scikit-learn Pipeline vs. Separate Vectorizer/Model:**
   - *Decision:* Bundle the `TfidfVectorizer` and `MultinomialNB` into an `sklearn.pipeline.Pipeline` or a structured dictionary bundle when saving to Joblib.
   - *Rationale:* Eliminates desynchronization between feature extraction and classification during inference.
2. **In-Memory Model Loading:**
   - *Decision:* Load the model artifact once at Flask application startup (`app.py`), storing it in application memory context.
   - *Rationale:* Loading a Joblib file from disk takes ~100ms. Doing this on every HTTP request would create severe latency; in-memory inference takes under 1ms per SMS.
3. **Stateless API Design:**
   - *Decision:* All endpoints are stateless; no session cookies or user authentication required for MVP.
   - *Rationale:* Minimizes technical debt, prevents security vulnerabilities related to session hijacking, and fits the academic schedule.
