# 07. Data Models, Schemas & Data Structures

> **Document Status:** `PROPOSED` Baseline  
> **Project ID:** NLP-04  
> **Product Working Title:** SMS Shield  
> **Lead Author:** M1 (Project Lead)  
> **Contributors:** M2, M3, M4

---

## 1. Architectural Distinction: Storage vs. In-Memory vs. Network

To eliminate confusion between different stages of data handling:
1. **Dataset Schemas (Disk/CSV):** The tabular representation of text records on the filesystem.
2. **In-Memory Data Structures (Python):** Native Python dictionaries, lists, NumPy arrays, and Pandas DataFrames manipulated at runtime.
3. **API JSON Contracts (Network Payloads):** Serialized JSON objects transmitted over HTTP between client and server.
4. **Persistent Storage Models:** *None.* SMS Shield uses a stateless, in-memory model without a persistent SQL/NoSQL database for the MVP.

---

## 2. Dataset Schemas (Tabular / CSV)

### 2.1 Proposed Raw Dataset Schema (`data/raw/`)
*Reference Source:* UCI Machine Learning Repository - SMS Spam Collection (`SMSSpamCollection.txt` / CSV format).  
*Dataset Status:* `PROPOSED / PENDING DOWNLOAD AND VERIFICATION BY M1`.

The original UCI collection is traditionally formatted as a tab-separated text file without headers:

| Raw Column Index | Field Name | Data Type | Permitted Values | Description |
| :--- | :--- | :--- | :--- | :--- |
| Column 0 (`v1`) | `label` | String | `"ham"`, `"spam"` | Ground truth binary classification label. |
| Column 1 (`v2`) | `text` | String | Any text | Raw SMS message body (raw, unescaped text). |

*Standardization on Ingestion:*  
When parsed by `src/analytics/engine.py` or `src/models/train.py`, columns are explicitly normalized to:
```python
COLUMNS = ["label", "message"]
```

### 2.2 Cleaned / Processed Dataset Schema (`data/processed/sms_cleaned.csv`)
Generated after running `src/nlp/preprocessor.py` during offline training:

| Column Name | Data Type | Nullable | Example Value | Description |
| :--- | :--- | :--- | :--- | :--- |
| `label` | String | No | `"spam"` | Original ground-truth label (`ham` or `spam`). |
| `label_encoded` | Integer | No | `1` | Binary encoding (`0` for `ham`, `1` for `spam`). |
| `original_message`| String | No | `"WINNER!! Claim £1000 prize now!"` | Untouched original message text. |
| `cleaned_message` | String | No | `"winner claim <CURR> prize now"` | Output after lowercasing, regex cleaning, and stopword removal. |
| `char_length` | Integer | No | `31` | Character count of the original message. |
| `word_count` | Integer | No | `5` | Word/token count of the original message. |

---

## 3. Training & Feature Extraction Representations

### 3.1 Feature Representation (TF-IDF Matrix)
- **Object:** `scikit-learn.feature_extraction.text.TfidfVectorizer`
- **Output:** Scipy CSR (Compressed Sparse Row) matrix of shape `(n_samples, n_features)`.
- **Configuration (Proposed Baseline):**
  - `ngram_range`: `(1, 2)` (extracts both unigrams like "prize" and bigrams like "claim prize").
  - `max_features`: `3,000` to `5,000` (caps vocabulary size to prevent overfitting and memory bloat).
  - `sublinear_tf`: `True` (applies sublinear scaling $1 + \log(\text{tf})$ to reduce the impact of very high frequency words).
  - `stop_words`: Handled by custom preprocessor; vectorizer receives pre-filtered text.

### 3.2 Serialized Model Bundle (`models/model_pipeline.joblib`)
The saved artifact is an `sklearn.pipeline.Pipeline` or a Python dictionary serialized via `joblib.dump()`:
```python
{
    "model_name": "MultinomialNB",
    "version": "1.0.0",
    "trained_at": "2026-11-20T14:30:00Z",
    "pipeline": Pipeline([
        ("tfidf", TfidfVectorizer(...)),
        ("classifier", MultinomialNB(alpha=0.1))
    ]),
    "class_labels": ["HAM", "SPAM"],
    "metrics": {
        "accuracy": 0.985,
        "precision": 0.978,
        "recall": 0.912,
        "f1_score": 0.944
    }
}
```

---

## 4. In-Memory Runtime Data Structures

### 4.1 Single Prediction Internal Object
Returned by `src/models/predict.py`:
```python
@dataclass
class PredictionResult:
    label: str               # "HAM" or "SPAM"
    confidence: float        # e.g., 0.964 (between 0.0 and 1.0)
    ham_probability: float   # e.g., 0.036
    spam_probability: float  # e.g., 0.964
    cleaned_text: str        # Preprocessed token string
    original_text: str       # Raw input string
```

### 4.2 Bulk CSV Batch Processing Result
Processed in `src/utils/file_handlers.py`:
```python
@dataclass
class BulkBatchResult:
    total_records: int
    ham_count: int
    spam_count: int
    spam_percentage: float
    preview_records: list[dict] # First 10 records for UI table preview
    temp_file_id: str           # UUID used to retrieve the download CSV
```

---

## 5. API Network Payloads (JSON Formats)

### 5.1 Single Prediction Request (`POST /api/predict`)
```json
{
  "text": "Congratulations! You have won a 1000 Walmart gift card. Go to http://scam.link to claim."
}
```

### 5.2 Single Prediction Response
```json
{
  "status": "success",
  "data": {
    "original_text": "Congratulations! You have won a 1000 Walmart gift card. Go to http://scam.link to claim.",
    "cleaned_text": "congratulations won <NUM> walmart gift card go <URL> claim",
    "label": "SPAM",
    "confidence": 0.974,
    "probabilities": {
      "ham": 0.026,
      "spam": 0.974
    }
  }
}
```

### 5.3 Analytics Response (`GET /api/analytics`)
```json
{
  "status": "success",
  "data": {
    "dataset_summary": {
      "total_records": 5572,
      "ham_count": 4825,
      "spam_count": 747,
      "spam_percentage": 13.41,
      "avg_ham_length": 71.02,
      "avg_spam_length": 138.87
    },
    "model_evaluation": {
      "model_name": "Multinomial Naive Bayes",
      "accuracy": 0.985,
      "precision": 0.978,
      "recall": 0.912,
      "f1_score": 0.944,
      "confusion_matrix": {
        "true_negatives": 965,
        "false_positives": 2,
        "false_negatives": 13,
        "true_positives": 135
      }
    }
  }
}
```

---

## 6. Bulk Export CSV Schema

When the user clicks "Download Results CSV", the generated CSV has the following guaranteed column layout:

| Column Header | Format | Sample Value |
| :--- | :--- | :--- |
| `original_message` | String | `"Hey are we still meeting today?"` |
| `cleaned_message` | String | `"hey still meeting today"` |
| `predicted_label` | String | `"HAM"` |
| `confidence_score`| Float (2 decimals) | `0.99` |
| `spam_probability`| Float (4 decimals) | `0.0078` |
