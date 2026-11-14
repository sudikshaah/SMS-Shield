# 01. Project Overview: SMS Text Cleaning and Classification System

> **Document Status:** `PROPOSED` Baseline  
> **Academic Project ID:** NLP-04  
> **Product Working Title:** SMS Shield  
> **Lead Author:** M1 (Project Lead)  
> **Contributors:** M2, M3, M4, M5

---

## 1. Project Background

Short Message Service (SMS) remains one of the most ubiquitous and trusted telecommunication mediums globally, boasting high open rates within minutes of delivery. However, this high level of user trust is constantly exploited by malicious actors, unscrupulous telemarketers, and phishing syndicates. Unsolicited text messages (commonly termed "Spam") frequently contain phishing links, fake financial lottery notifications, urgent impersonation scams (e.g., fraudulent banking alerts), or malware distribution vectors.

Traditional cellular carriers employ heuristic keyword filters, but spammers routinely circumvent them by introducing deliberate typos (e.g., "W1N", "c@sh"), obfuscated URLs, character padding, and informal syntax. Consequently, robust natural language processing (NLP) and machine learning (ML) classification systems are necessary to evaluate the lexical, syntactic, and probabilistic patterns of SMS messages to protect end-users.

---

## 2. Problem Statement

Given an arbitrary text message $T$, determine whether $T$ belongs to class $C \in \{\text{HAM}, \text{SPAM}\}$, where:
- **HAM:** Legitimate, non-malicious interpersonal or authentic transactional communication.
- **SPAM:** Unsolicited commercial advertising, fraudulent financial promotions, or malicious phishing attempts.

The technical challenge lies in:
1. **Noisy Text Data:** SMS messages are informal, containing abbreviations, slang, non-standard punctuation, and embedded URLs.
2. **Short Text Constraints:** Traditional documents provide extensive word count for statistical profiling; SMS messages are concise (typically < 160 characters), requiring highly discriminative feature representations (such as TF-IDF n-grams).
3. **Class Imbalance:** In real-world data, legitimate messages significantly outnumber spam messages (typically ~85% Ham vs. ~15% Spam), meaning naive accuracy is a deceptive metric.
4. **Asymmetric Error Costs:** Marking an urgent legitimate message as Spam (False Positive) is far more disruptive to a user than letting a minor promotional spam message slip through (False Negative).

---

## 3. Project Objectives

1. **Build a Reproducible NLP Preprocessing Pipeline:** Clean raw SMS texts by normalizing casing, tokenizing, sanitizing URLs and phone numbers, eliminating noisy punctuation, and stripping non-essential stopwords while preserving sentiment/negation tokens (`not`, `no`, `never`).
2. **Train and Compare Machine Learning Classifiers:** Extract features using TF-IDF and compare standard supervised algorithms:
   - **Multinomial Naive Bayes (MNB):** Baseline probabilistic model ideal for sparse categorical text data.
   - **Logistic Regression (LR):** Linear discriminant model providing well-calibrated probability scores.
3. **Develop a Modular Backend Service:** Implement a lightweight Flask REST API to serve predictions synchronously for both individual messages and bulk datasets.
4. **Create a Beginner-Friendly, Responsive Web UI:** Build a clear, accessible dashboard in HTML5, CSS3, and Vanilla JavaScript that enables text input, CSV drag-and-drop, and visual data representation using Chart.js.
5. **Ensure Academic Transparency & Explainability:** Provide model evaluation metrics (Precision, Recall, F1-Score, Confusion Matrix) and exploratory dataset insights within the web application.

---

## 4. Target Users & Stakeholders

| User Group | Needs & Expectations | Primary Interaction |
| :--- | :--- | :--- |
| **Everyday Mobile Users / Consumers** | Quick, intuitive way to check if a suspicious text message received on their phone is a scam or authentic. | Single SMS classification input box with clear visual indicators (green = Ham, red = Spam). |
| **System Administrators / Analysts** | Capability to upload batched log files or customer complaints to filter spam at scale and extract clean datasets. | Bulk CSV upload interface with progress feedback and downloadable annotated CSVs. |
| **Academic Evaluators / Viva Examiners** | Verification of sound engineering practices, proper ML protocols (no data leakage, stratified splits), and deep understanding of NLP fundamentals. | Evaluation metrics dashboard, code structure, technical documentation, and oral defense. |

---

## 5. Scope of the Project

### 5.1 In Scope (MVP & Academic Deliverables)
- Automated text cleaning pipeline implemented in Python standard library and Scikit-learn.
- Supervised binary classification on the English SMS Spam Collection dataset.
- Single text classification with confidence probability output.
- Batch CSV upload, parsing, processing, and enriched CSV export.
- Static analytics dashboard showing class distribution, average text lengths, and vocabulary highlights.
- In-memory model persistence using Joblib.
- Unit and integration tests using Pytest.
- Comprehensive technical documentation, GitHub collaboration history, presentation slides, and viva guide.

### 5.2 Out of Scope (Deferred or Excluded)
- Real-time mobile carrier SMS interception or native Android/iOS mobile application development.
- Multilingual / non-English script classification (e.g., Hindi, Spanish, or regional dialects).
- Complex deep learning models (e.g., Transformers, BERT, LSTM) due to hardware constraints and beginner learning curve.
- Distributed streaming architectures (Kafka, Celery, Redis).
- User authentication, login credentials, or persistent relational database management systems (RDBMS) unless explicitly required for MVP persistence.

---

## 6. Technical Limitations & Constraints

1. **Domain Dependency:** The model is trained on historical SMS datasets (e.g., UCI SMS Spam Collection). It may exhibit lower accuracy on modern WhatsApp, Telegram, or email spam with distinct formatting patterns.
2. **Contextual Nuance:** Pure bag-of-words / TF-IDF representations lack deep semantic understanding of intricate contextual sarcasm or indirect social engineering attacks.
3. **Compute & Infrastructure Constraints:** The application is developed locally on standard personal computers without specialized GPU acceleration.
4. **Development Timeframe:** 2–3 weeks total execution window by undergraduate students balancing coursework.

---

## 7. Expected Academic Outcomes

1. A fully functioning, demonstrable local web application.
2. A clean, well-tested Python codebase adhering to PEP 8 standards.
3. An active GitHub repository reflecting authentic commit histories, pull requests, and peer reviews across all 5 members.
4. A formal project report and slide deck ready for academic defense and external viva examinations.
