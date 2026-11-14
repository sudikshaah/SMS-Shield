# 03. Feature Specification: Detailed Technical Mechanics

> **Document Status:** `PROPOSED` Baseline  
> **Project ID:** NLP-04  
> **Product Working Title:** SMS Shield  
> **Authors:** M1, M2, M3, M4, M5

---

## 1. Feature 1: Single SMS Input and Preprocessing Inspection

### 1.1 Purpose
Allows an end-user to paste any raw SMS text message, observe how the preprocessing pipeline sanitizes the message, and review the resulting tokenized representation.

### 1.2 Input
- **Source:** User text area in the web interface.
- **Data Type:** String.
- **Constraints:** Maximum 1,000 characters. UTF-8 encoded.

### 1.3 Processing Pipeline
1. **Validation:** Check if input string is non-empty and contains non-whitespace characters.
2. **Lowercasing:** Convert all characters to lowercase.
3. **URL Handling:** Regex match URL patterns (`https?://\S+|www\.\S+`) and replace with token `<URL>`.
4. **Phone / Number Handling:** Regex match digit sequences (e.g., 10-digit numbers or currency amounts like `£1000` or `$500`) and replace with token `<NUM>` or `<CURR>`.
5. **Punctuation & Special Characters:** Remove punctuation characters except those required for token delineation.
6. **Tokenization:** Split text into constituent words/tokens.
7. **Stopword Filtering with Negation Preservation:** Remove standard English stopwords (from NLTK/Scikit-learn list), but **explicitly retain** negation words (`not`, `no`, `never`, `neither`, `nor`, `can't`, `won't`).
8. **Reconstruction:** Join cleaned tokens back into a normalized whitespace-delimited string.

### 1.4 Output
- Cleaned string displayed in a "Preprocessed View" panel on the UI.
- Token count (original vs. cleaned).

### 1.5 Edge Cases & Handling
| Edge Case | Expected System Behavior |
| :--- | :--- |
| Whitespace only or empty string | Reject with HTTP 400 and UI warning: *"Please enter text to analyze."* |
| Input consists purely of emojis (e.g. `🎉🔥😂`) | Preprocessing strips or replaces symbols; if no valid tokens remain, return warning: *"Message contains insufficient text tokens."* |
| Extremely long input (> 1,000 chars) | Frontend truncates or blocks input; backend truncates to 1,000 chars and warns user. |
| Mixed languages (e.g., Hindi in Latin script) | Preprocessed as Latin tokens; model evaluates based on known English vocabulary. |

### 1.6 Acceptance Criteria
- [ ] User typing a message with a URL (e.g., `Claim prize at http://win.xyz`) sees `<URL>` in preprocessed output.
- [ ] Negations such as `not available` do not have `not` removed.
- [ ] Cleaned output is visible in the UI within 100ms.

---

## 2. Feature 2: Spam / Ham Prediction & Confidence Scoring

### 2.1 Purpose
Transforms the preprocessed SMS text into statistical features using a fitted TF-IDF Vectorizer and generates a binary classification decision with an associated probability score.

### 2.2 Input
- Cleaned text string produced by the preprocessing module.

### 2.3 Processing Pipeline
1. Transform cleaned text using the pre-fitted `TfidfVectorizer.transform([cleaned_text])`.
2. Compute class probabilities using `classifier.predict_proba(vector)`:
   - $P(\text{HAM} \mid \text{text})$
   - $P(\text{SPAM} \mid \text{text})$
3. Determine predicted label:
   - If $P(\text{SPAM}) \ge 0.50 \implies \text{SPAM}$ (Default decision threshold = 0.50).
   - Else $\implies \text{HAM}$.
4. Compute confidence score:
   - For predicted class $C$, $\text{Confidence} = \max(P(\text{HAM}), P(\text{SPAM})) \times 100\%$.

### 2.4 Output
- JSON object containing:
  ```json
  {
    "label": "SPAM",
    "confidence": 0.942,
    "probabilities": {
      "ham": 0.058,
      "spam": 0.942
    },
    "cleaned_text": "claim free prize now call <NUM>"
  }
  ```

### 2.5 Edge Cases & Handling
| Edge Case | Expected System Behavior |
| :--- | :--- |
| Out-Of-Vocabulary (OOV) words (every word is unknown to TF-IDF) | TF-IDF vector is all zeros. Model falls back to prior class distribution ($\approx 86\%$ Ham), labels as `HAM` with a low-confidence flag. |
| Borderline message ($P(\text{SPAM}) \approx 0.51$) | Display label with visual "Medium / Low Confidence" warning badge. |

### 2.6 Acceptance Criteria
- [ ] Known spam phrase (e.g., *"Free entry in 2 a weekly competition to win FA Cup final tkts"*) classifies as `SPAM`.
- [ ] Known ham phrase (e.g., *"Hey mom, I will be home by 6 for dinner"*) classifies as `HAM`.
- [ ] Confidence score is strictly bounded in the range $[0.0, 1.0]$.

---

## 3. Feature 3: Bulk CSV Upload & Batch Inference

### 3.1 Purpose
Enables processing of large volumes of SMS messages stored in tabular CSV format for administrative scanning and batch labeling.

### 3.2 Input
- File upload via `multipart/form-data`.
- Format: `.csv` file.
- Max file size: 5 MB (~20,000 SMS lines).

### 3.3 Processing Pipeline
1. **File Validation:**
   - Verify file extension is `.csv`.
   - Verify MIME type (`text/csv`, `application/vnd.ms-excel`, or `text/plain`).
   - Check file size does not exceed 5 MB limit.
2. **CSV Parsing:**
   - Read CSV into a Pandas DataFrame using `pd.read_csv()`.
   - Auto-detect the text column name from candidate list: `['message', 'text', 'sms', 'sms_text', 'v2', 'content']`.
   - If no candidate column matches, default to the first string column in the DataFrame.
3. **Batch Preprocessing & Inference:**
   - Apply vectorization and inference across all valid text rows using vectorized Pandas/Scikit-learn operations.
   - Append two new columns: `predicted_label` and `confidence_score`.
4. **Summary Aggregation:**
   - Calculate total rows, total Ham, total Spam, and average confidence.
5. **Output Generation:**
   - Save temporary annotated CSV or generate in-memory `StringIO` buffer for download.
   - Return top 10 preview rows in JSON to display on the web dashboard.

### 3.4 Output
- JSON response:
  ```json
  {
    "total_messages": 150,
    "ham_count": 128,
    "spam_count": 22,
    "spam_percentage": 14.67,
    "preview": [
      {
        "original_text": "Call me later",
        "predicted_label": "HAM",
        "confidence": 0.985
      }
    ],
    "download_url": "/api/download/bulk-results-uuid.csv"
  }
  ```

### 3.5 Edge Cases & Handling
| Edge Case | Expected System Behavior |
| :--- | :--- |
| Uploaded file is not a valid CSV (e.g., a `.pdf` or corrupted text file) | HTTP 400: *"Invalid file format. Please upload a standard CSV file."* |
| CSV is completely empty (0 bytes) | HTTP 400: *"Uploaded CSV file is empty."* |
| CSV has no recognizable text column | HTTP 400: *"Could not locate a text column. Ensure your CSV has a column named 'message' or 'text'."* |
| Rows contain empty/null values (`NaN`) | Null rows are skipped or filled with empty string `""` and marked `INVALID / SKIPPED`. |

### 3.6 Acceptance Criteria
- [ ] Uploading a 500-row CSV completes processing in under 2 seconds.
- [ ] Summary counts accurately equal the total number of valid rows processed.
- [ ] User can download the exact enriched CSV file with the same number of rows.

---

## 4. Feature 4: Downloadable Annotated CSV

### 4.1 Purpose
Provides a direct mechanism for analysts to retrieve their classified batch results with full metadata.

### 4.2 Input
- GET request specifying the temporary file token or ID.

### 4.3 Processing
- Validate token existence in the temporary session directory.
- Return file stream with HTTP header:
  `Content-Disposition: attachment; filename="sms_shield_predictions_timestamp.csv"`.
- Clean up temporary files older than 30 minutes via scheduled or on-access cleanup.

### 4.4 Output
- CSV file download.

### 4.5 Acceptance Criteria
- [ ] File downloads with appropriate MIME type `text/csv`.
- [ ] Contains all original input columns plus `cleaned_text`, `predicted_label`, and `confidence_score`.

---

## 5. Feature 5: Exploratory & Prediction Analytics Dashboard

### 5.1 Purpose
Visualizes key properties of the training corpus and live batch predictions to provide statistical transparency.

### 5.2 Visual Components
1. **Class Distribution Chart (Pie / Doughnut Chart):** Displays the proportion of Ham vs. Spam in the dataset (baseline reference).
2. **Message Length Distribution Chart (Bar / Histogram):** Compares character count distributions of legitimate vs. spam messages (Spam messages are typically longer, often hovering around 130–160 characters).
3. **Batch Classification Ratio (Pie Chart):** Dynamic chart rendering the Ham vs. Spam split from the most recent bulk upload.

### 5.3 Technical Implementation
- Pure client-side Chart.js rendering receiving structured numerical arrays from the backend `/api/analytics` endpoint.

---

## 6. Feature 6: Model Evaluation & Explainability Panel

### 6.1 Purpose
Showcases the comparative academic evaluation metrics between Multinomial Naive Bayes and Logistic Regression on the test split.

### 6.2 Displayed Metrics Table
- Precision, Recall, and F1-Score for both Ham and Spam classes.
- Macro and Weighted Averages.
- Normalized and raw 2x2 Confusion Matrix:
  - **True Positives (TP):** Spam correctly flagged as Spam.
  - **True Negatives (TN):** Ham correctly identified as Ham.
  - **False Positives (FP):** Ham mistakenly labeled as Spam (*High Cost Error*).
  - **False Negatives (FN):** Spam mistakenly labeled as Ham (*Low Cost Error*).
