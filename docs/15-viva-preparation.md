# 15. Academic Viva Voce Defense Guide & Technical Q&A

> **Document Status:** `PROPOSED` Baseline  
> **Project ID:** NLP-04  
> **Product Working Title:** SMS Shield  
> **Target Audience:** All 5 Team Members (M1, M2, M3, M4, M5)  
> **Author:** M1 (Project Lead)

---

## 1. Project-Level Core Questions (All Members Must Know)

### Q1: What is the primary objective of SMS Shield?
**Answer:** SMS Shield is a natural language processing and machine learning web application that classifies SMS text messages as either legitimate (HAM) or unsolicited/scam (SPAM). It offers real-time single message classification, bulk CSV file processing, and interactive visual analytics to explain model decisions and corpus statistics.

### Q2: Why is accuracy alone an insufficient evaluation metric for SMS spam detection?
**Answer:** SMS datasets suffer from severe **class imbalance** (typically ~87% Ham vs. ~13% Spam). A naive dummy classifier that predicts "HAM" for every single message would achieve 87% accuracy while completely failing to detect a single spam message! Therefore, we evaluate models using **Precision, Recall, and F1-Score**, focusing particularly on the minority Spam class and the Confusion Matrix.

### Q3: What is the difference between a False Positive and a False Negative in this domain, and which is more severe?
**Answer:**
- **False Positive (Type I Error):** The model mistakenly classifies a legitimate message (Ham) as Spam. For example, a bank OTP or an urgent family message being quarantined or deleted.
- **False Negative (Type II Error):** The model lets a Spam message slip through as Ham.
- **Severity:** In SMS classification, a **False Positive is far more hazardous and costly** to user trust than a False Negative. Missing a single promotional spam text is a minor annoyance, but missing a critical flight confirmation or banking OTP can cause major real-world harm. Hence, we tune our model for high **Precision** on the Spam class.

### Q4: Explain the difference between Data Leakage and Stratified Splitting.
**Answer:**
- **Data Leakage:** Occurs when information from the test dataset unintentionally influences the training process (e.g., fitting the TF-IDF vectorizer on the whole dataset before train-test splitting). We strictly prevent this by calling `.fit()` only on the training split.
- **Stratified Splitting:** Ensures that the proportion of Ham and Spam classes in both the training set (80%) and the test set (20%) matches the exact proportion found in the original corpus. Standard random splitting might leave the test set with too few spam examples.

---

## 2. Role-Specific Viva Questions

### 2.1 Member 1 (Project Lead & Data Analytics)

#### Q1: What insights did you uncover during the Exploratory Data Analysis (EDA)?
**Answer:** Our EDA revealed three primary findings:
1. **Class Imbalance:** Approximately 86.6% Ham vs. 13.4% Spam in the UCI collection.
2. **Length Disparity:** Spam messages are systematically longer (average character length ~138 characters, heavily clustered near the 160-character cellular limit) compared to Ham messages (average ~71 characters).
3. **Lexical Patterns:** Spam messages contain distinct high-frequency tokens like currency symbols (`£`, `$`), urgent action verbs (`claim`, `call`, `win`, `urgent`), and embedded URLs.

#### Q2: How are analytics data structured for rendering on the frontend?
**Answer:** In `src/analytics/engine.py`, we aggregate class counts and bin message lengths into histogram frequencies. These are returned as clean numerical arrays in the `/api/analytics` JSON payload, allowing Chart.js on the client to draw responsive charts without complex client-side computation.

---

### 2.2 Member 2 (NLP & Preprocessing Developer)

#### Q1: Walk through your text preprocessing pipeline step by step.
**Answer:**
1. **Lowercasing:** Converts all characters to lowercase to treat "FREE", "Free", and "free" identically.
2. **URL Masking:** Regular expressions detect web addresses and replace them with a unified token `<URL>`. This captures the presence of a link without fragmenting the vocabulary with unique domains.
3. **Number & Currency Masking:** Digit sequences and monetary symbols are masked as `<NUM>` and `<CURR>`.
4. **Punctuation Removal:** Eliminates noisy exclamation points and special symbols.
5. **Tokenization:** Breaks the normalized sentence into individual words.
6. **Stopword Removal with Negation Preservation:** Removes common English stopwords (e.g., "is", "at", "which"), but explicitly preserves negation words like "not", "no", and "never" because they drastically alter semantic intent.

#### Q2: Why did you decide to preserve negations instead of using a standard stopword list?
**Answer:** Default stopword libraries (like NLTK or Scikit-learn) remove words like "not" or "no". In sentences like *"I am not interested, do not call me"*, stripping negations leaves *"interested call"*, which could be mistakenly classified as promotional interest! Retaining negations preserves the negative sentiment essential for proper classification.

---

### 2.3 Member 3 (Machine Learning Developer)

#### Q1: How does TF-IDF feature extraction work?
**Answer:** TF-IDF stands for Term Frequency-Inverse Document Frequency:
- **Term Frequency (TF):** Measures how frequently a word appears in a specific SMS message: $\text{TF}(t, d) = \frac{\text{count}(t, d)}{\text{total words in } d}$.
- **Inverse Document Frequency (IDF):** Measures how rare or common a word is across the entire corpus: $\text{IDF}(t) = \log\left(\frac{1 + N}{1 + \text{DF}(t)}\right) + 1$, where $N$ is total documents and $\text{DF}(t)$ is the number of documents containing term $t$.
- **TF-IDF:** $\text{TF}(t, d) \times \text{IDF}(t)$. Words that appear frequently in a specific message but rarely across all messages (such as "lottery" or "prize") receive high scores, making them powerful discriminative features.

#### Q2: Why choose Multinomial Naive Bayes as the primary model over complex Deep Learning?
**Answer:**
1. **Theoretical Fit:** Multinomial Naive Bayes operates on discrete word counts and frequencies, making it exceptionally well-suited for high-dimensional, sparse text vectors.
2. **Speed & Efficiency:** It trains in milliseconds and requires negligible memory, running smoothly on local consumer hardware.
3. **Strong Empirical Performance:** For short-text SMS classification, MNB with TF-IDF routinely achieves $>98\%$ accuracy and high precision, matching or outperforming deep neural networks without requiring GPUs.
4. **Explainability:** MNB probabilities derive from direct Bayes' Theorem calculations, which can be easily explained and defended in an academic viva.

---

### 2.4 Member 4 (Backend Developer)

#### Q1: How does the Flask backend integrate the trained ML model?
**Answer:** The trained Scikit-learn pipeline (containing both the fitted `TfidfVectorizer` and `MultinomialNB`) is serialized to disk using `joblib.dump()`. In `app.py`, we load this pipeline into application memory **once at server startup**. When an HTTP `POST` arrives at `/api/predict`, the text is preprocessed and passed to `pipeline.predict_proba()`. Loading once ensures response times under 20 milliseconds, avoiding disk I/O bottlenecks.

#### Q2: How did you implement security and error handling for bulk CSV uploads?
**Answer:**
1. We enforce a maximum upload limit of 5 MB via Flask's `MAX_CONTENT_LENGTH`.
2. We validate that the uploaded file has a `.csv` extension and correct MIME type.
3. We sanitize filenames using `secure_filename()` and generate random UUIDs for temporary storage to prevent Path Traversal attacks.
4. We wrap parsing in try-except blocks to catch corrupt CSV formatting and return structured JSON error messages (HTTP 400/415) rather than allowing 500 server crashes.

---

### 2.5 Member 5 (Frontend Developer)

#### Q1: Why did you use Vanilla JavaScript instead of React or Vue?
**Answer:**
1. **Academic Appropriateness:** Vanilla ES6+ JavaScript eliminates the overhead of Node.js dependencies, npm packages, Babel/Webpack build steps, and CORS configuration.
2. **Lightweight & Fast:** The application loads in milliseconds with zero framework bloat.
3. **Direct Integration:** Vanilla JS can make modern `async/await` fetch requests and manipulate the DOM directly, fulfilling all MVP requirements cleanly and robustly.

#### Q2: How did you prevent Cross-Site Scripting (XSS) when rendering user-submitted text?
**Answer:** When rendering user SMS text or CSV preview records in the browser, we never use `innerHTML`. Instead, we assign strings using `element.textContent` or `document.createTextNode()`. This ensures that even if an SMS contains `<script>alert('hack')</script>`, the browser treats it purely as plain characters rather than executable code.
