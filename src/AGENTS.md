# Scoped Developer & Agent Guidelines: `src/`

> **Directory Scope:** `src/` (Core Application Source Code)  
> **Parent Manual:** Consult root [AGENTS.md](file:///c:/Users/Admin/Desktop/AI-proj-3rd-sem/AGENTS.md) for overarching repository policies.

---

## 1. Directory Structure & Responsibilities

The `src/` directory houses the modular business logic of the SMS Shield application:

- **`src/nlp/` (Owned by M2):**
  - Text normalization, tokenization, regex cleaning, URL replacement, stopword management, negation handling.
  - Primary interface: `clean_text(text: str) -> str` and `tokenize(text: str) -> list[str]`.
  - Must remain independent of Flask and web concerns. Must be pure Python standard library / Scikit-learn / NLTK.

- **`src/models/` (Owned by M3):**
  - Training scripts, vectorizer definitions, model evaluation utilities, serialization/deserialization.
  - Primary interface: `train_pipeline()`, `load_pipeline()`, and `predict_message(model, text)`.
  - Must persist and load both the fitted `TfidfVectorizer` and the trained classifier together (e.g., using `sklearn.pipeline.Pipeline` or a dictionary bundle saved via `joblib`).

- **`src/analytics/` (Owned by M1):**
  - Dataset inspection routines, word frequency analysis, spam vs. ham length distributions, vocabulary metrics.
  - Primary interface: `get_dataset_statistics()`, `get_prediction_summary()`.

- **`src/api/` (Owned by M4):**
  - Flask Blueprints or route handlers (`routes.py`), request parameter validation, JSON serialization.
  - Coordinates calls between `src/nlp/`, `src/models/`, and `src/analytics/`.

- **`src/utils/` (Owned by M4 / Shared):**
  - Reusable helper functions: CSV parsing, file size validation, safe temporary file cleanup, standard JSON response formatters.

---

## 2. Guardrails for `src/` Code Modifications

1. **Decoupled Architecture:** `src/nlp/` and `src/models/` must NOT import Flask or request contexts. They must remain callable from standalone CLI scripts, Jupyter notebooks, or background workers.
2. **Defensive Input Handling:** Never assume input text is a non-empty string. Guard against `None`, numeric types, empty strings, and excessive character lengths (> 5,000 characters).
3. **No Retraining at Inference:** Never call `.fit()` or `.fit_transform()` inside any request handling path. Only call `.transform()` and `.predict()` / `.predict_proba()`.
4. **Thread Safety & Global State:** In Flask, the loaded model in memory should be treated as read-only. Do not mutate model state across concurrent requests.
