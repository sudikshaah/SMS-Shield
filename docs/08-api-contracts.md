# 08. REST API Contracts & Endpoint Specifications

> **Document Status:** `PROPOSED` Baseline  
> **Project ID:** NLP-04  
> **Product Working Title:** SMS Shield  
> **Lead Author:** M4 (Backend Developer)  
> **Reviewers:** M5 (Frontend), M3 (ML), M1 (Lead)

---

## 1. General API Conventions

- **Base URL:** `http://127.0.0.1:5000` (Local Development)
- **Content-Type:** `application/json` (unless handling file uploads via `multipart/form-data`)
- **Status Field:** All JSON responses include a top-level `"status"` field (`"success"` or `"error"`).
- **HTTP Status Codes:**
  - `200 OK`: Request succeeded.
  - `400 Bad Request`: Validation failure, empty text, or malformed JSON.
  - `413 Payload Too Large`: Uploaded file exceeds maximum allowed size (5 MB).
  - `415 Unsupported Media Type`: Non-CSV file uploaded.
  - `500 Internal Server Error`: Unhandled server exception.

---

## 2. Endpoint Specifications

### 2.1 Web Interface Root: `GET /`
- **Purpose:** Serves the main Single-Page Application (HTML dashboard).
- **HTTP Method:** `GET`
- **Headers:** `Accept: text/html`
- **Response Format:** Rendered HTML5 template (`templates/index.html`).
- **Status Codes:**
  - `200 OK`

---

### 2.2 Health Check: `GET /api/health`
- **Purpose:** Verifies that the Flask web server is active and the machine learning model is loaded in memory.
- **HTTP Method:** `GET`
- **Request Headers:** None
- **Response Body (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "service": "SMS Shield API",
      "model_loaded": true,
      "model_name": "MultinomialNB",
      "version": "1.0.0"
    }
  }
  ```
- **Error Response (`503 Service Unavailable`):**
  ```json
  {
    "status": "error",
    "error": {
      "code": "MODEL_NOT_LOADED",
      "message": "Model artifact is missing or failed to initialize."
    }
  }
  ```

---

### 2.3 Single SMS Prediction: `POST /api/predict`
- **Purpose:** Classifies a single SMS text message as `HAM` or `SPAM`.
- **HTTP Method:** `POST`
- **Request Headers:** `Content-Type: application/json`
- **Request Body Schema:**
  ```json
  {
    "text": "string (Required. 1 to 1000 characters)"
  }
  ```
- **Validation Rules:**
  1. `text` key must be present in JSON payload.
  2. `text` must be a string.
  3. `text.strip()` must have a length $\ge 1$ and $\le 1000$.
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "original_text": "Free entry in 2 a weekly competition to win FA Cup final tickets! Text FA to 87121",
      "cleaned_text": "free entry <NUM> weekly competition win fa cup final tickets text fa <NUM>",
      "label": "SPAM",
      "confidence": 0.9842,
      "probabilities": {
        "ham": 0.0158,
        "spam": 0.9842
      }
    }
  }
  ```
- **Error Responses:**
  - *Missing or empty text (`400 Bad Request`):*
    ```json
    {
      "status": "error",
      "error": {
        "code": "VALIDATION_ERROR",
        "message": "Field 'text' is required and must not be empty."
      }
    }
    ```
  - *Text too long (`400 Bad Request`):*
    ```json
    {
      "status": "error",
      "error": {
        "code": "PAYLOAD_TOO_LARGE",
        "message": "Text exceeds maximum character limit of 1,000 characters."
      }
    }
    ```

---

### 2.4 Bulk CSV Prediction: `POST /api/bulk-predict`
- **Purpose:** Accepts an uploaded CSV file of SMS messages, executes batch inference, returns a summary with preview rows, and prepares a downloadable annotated file.
- **HTTP Method:** `POST`
- **Request Content-Type:** `multipart/form-data`
- **Form Fields:**
  - `file`: The `.csv` file attachment (Max size: 5 MB).
- **Validation Rules:**
  1. File must have `.csv` extension.
  2. File stream must be $\le 5\text{ MB}$.
  3. CSV must contain at least one string/text column.
  4. CSV must contain $\ge 1$ valid data row.
- **Success Response (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "filename": "customer_messages.csv",
      "total_processed": 500,
      "ham_count": 435,
      "spam_count": 65,
      "spam_percentage": 13.0,
      "preview": [
        {
          "original_text": "Are you coming over for dinner?",
          "cleaned_text": "coming dinner",
          "predicted_label": "HAM",
          "confidence": 0.991
        },
        {
          "original_text": "URGENT! You have won £1000 prize. Call now!",
          "cleaned_text": "urgent won <CURR> prize call",
          "predicted_label": "SPAM",
          "confidence": 0.978
        }
      ],
      "download_url": "/api/download/bulk-e3b0c442-98fc.csv"
    }
  }
  ```
- **Error Responses:**
  - *No file uploaded (`400 Bad Request`):*
    ```json
    {
      "status": "error",
      "error": {
        "code": "MISSING_FILE",
        "message": "No file part in the request. Please provide a CSV file."
      }
    }
    ```
  - *Invalid file type (`415 Unsupported Media Type`):*
    ```json
    {
      "status": "error",
      "error": {
        "code": "INVALID_FILE_TYPE",
        "message": "Only .csv files are supported."
      }
    }
    ```
  - *File exceeds 5 MB (`413 Payload Too Large`):*
    ```json
    {
      "status": "error",
      "error": {
        "code": "FILE_TOO_LARGE",
        "message": "Uploaded file exceeds the maximum limit of 5 MB."
      }
    }
    ```

---

### 2.5 Bulk Results Download: `GET /api/download/<file_id>`
- **Purpose:** Streams the annotated CSV file generated by `/api/bulk-predict`.
- **HTTP Method:** `GET`
- **URL Parameter:** `file_id` (Safe sanitized string matching UUID format).
- **Response Headers:**
  - `Content-Type: text/csv; charset=utf-8`
  - `Content-Disposition: attachment; filename="sms_shield_results_<timestamp>.csv"`
- **Status Codes:**
  - `200 OK`: File downloaded.
  - `404 Not Found`: File ID expired or invalid.

---

### 2.6 Analytics & Model Metrics: `GET /api/analytics`
- **Purpose:** Retrieves dataset statistics and offline model evaluation metrics for dashboard rendering.
- **HTTP Method:** `GET`
- **Response Body (`200 OK`):**
  ```json
  {
    "status": "success",
    "data": {
      "corpus": {
        "dataset_name": "SMS Spam Collection (UCI)",
        "total_messages": 5572,
        "ham_count": 4825,
        "spam_count": 747,
        "spam_percentage": 13.41,
        "avg_ham_length": 71.02,
        "avg_spam_length": 138.87
      },
      "evaluation": {
        "model_name": "Multinomial Naive Bayes",
        "accuracy": 0.985,
        "precision": 0.978,
        "recall": 0.912,
        "f1_score": 0.944,
        "confusion_matrix": {
          "tn": 965,
          "fp": 2,
          "fn": 13,
          "tp": 135
        }
      }
    }
  }
  ```
- **Error Response (`500 Internal Server Error`):**
  ```json
  {
    "status": "error",
    "error": {
      "code": "ANALYTICS_UNAVAILABLE",
      "message": "Metrics could not be calculated or read."
    }
  }
  ```
