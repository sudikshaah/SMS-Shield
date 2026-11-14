# 02. Product Requirements Document (PRD)

> **Document Status:** `PROPOSED` Baseline  
> **Project ID:** NLP-04  
> **Product Working Name:** SMS Shield  
> **Author:** M1 (Project Lead)  
> **Reviewers:** M2 (NLP), M3 (ML), M4 (Backend), M5 (Frontend)

---

## 1. Product Vision

**SMS Shield** aims to be a transparent, accessible, and dependable desktop web application that empowers users to detect spam, phishing, and unwanted promotional SMS messages using understandable Natural Language Processing and Machine Learning techniques. It demonstrates how modern software engineering, statistical text analysis, and intuitive design converge to solve everyday digital communication security issues.

---

## 2. User Personas

### Persona A: Ananya (Everyday Smartphone User)
- **Background:** College student receiving numerous transactional SMS messages and suspicious prize giveaways.
- **Goal:** Wants to paste a suspicious text message into a simple box and immediately know if it is safe or a scam, along with an easy-to-read explanation.
- **Pain Point:** Cannot tell whether a text claiming her bank account is suspended is real or a phishing attempt.

### Persona B: Rajesh (Customer Support Lead / Data Analyst)
- **Background:** Manages an inbound customer support mailbox where users report SMS scams.
- **Goal:** Wants to upload a weekly CSV log containing hundreds of user-submitted texts, categorize them in bulk, and download the tagged spreadsheet for internal reporting.
- **Pain Point:** Manual categorization is tedious, error-prone, and unsustainable.

### Persona C: Dr. Sharma (Academic Project Evaluator / Viva Examiner)
- **Background:** University faculty member assessing technical merit, coding standards, and theoretical understanding of NLP/ML.
- **Goal:** Wants to inspect the preprocessing pipeline, compare model performance metrics (precision, recall, F1-score), review test coverage, and test edge cases live.
- **Pain Point:** Frustrated by "black-box" student projects that cannot explain their features or rely on unverified claims.

---

## 3. User Stories

| ID | As a... | I want to... | So that I can... | Priority |
| :--- | :--- | :--- | :--- | :--- |
| **US-01** | User | paste a single SMS text into an input box and click "Analyze" | immediately see whether it is classified as HAM or SPAM. | **Mandatory (MVP)** |
| **US-02** | User | see a confidence score or probability alongside the classification | gauge the certainty of the prediction. | **Mandatory (MVP)** |
| **US-03** | User | see the cleaned/preprocessed version of my input text | understand what tokens the model actually evaluated. | **Mandatory (MVP)** |
| **US-04** | Analyst | upload a `.csv` file containing multiple SMS messages | classify all records in a single batch operation. | **Mandatory (MVP)** |
| **US-05** | Analyst | preview the first few rows of classified messages in a table | verify the classification results before downloading. | **Mandatory (MVP)** |
| **US-06** | Analyst | download the batch classification results as an enriched CSV file | store, share, or analyze the output in external spreadsheet tools. | **Mandatory (MVP)** |
| **US-07** | Evaluator | view a dashboard displaying corpus statistics (Ham/Spam ratio, word counts) | assess the underlying data distribution and exploratory analysis. | **Mandatory (MVP)** |
| **US-08** | Evaluator | view comparative model evaluation metrics (Precision, Recall, F1, Confusion Matrix) | verify the academic rigor of the model selection process. | **Mandatory (MVP)** |
| **US-09** | User | receive friendly, actionable error messages if I submit an empty message or invalid file | correct my input without the application crashing. | **Mandatory (MVP)** |
| **US-10** | Analyst | view interactive graphical charts (bar charts, pie charts) of the results | present visual data insights during team or project meetings. | **Optional (Nice-to-have)** |

---

## 4. Functional Requirements (FR)

### Module 1: Single SMS Triage
- **FR-01 (Mandatory):** The system shall provide a multi-line text input field supporting up to 1,000 characters.
- **FR-02 (Mandatory):** The system shall validate that the text input is non-empty and contains at least one alphanumeric character before submission.
- **FR-03 (Mandatory):** Upon submission, the system shall execute text cleaning (lowercasing, URL masking, punctuation handling, negation preservation, stopword removal).
- **FR-04 (Mandatory):** The system shall output the predicted class (`HAM` or `SPAM`) with visual color coding (e.g., Green for Ham, Red for Spam).
- **FR-05 (Mandatory):** The system shall output a prediction confidence percentage (e.g., `87.4%`).
- **FR-06 (Mandatory):** The system shall display the preprocessed tokenized string for transparency.

### Module 2: Bulk CSV Processing
- **FR-07 (Mandatory):** The system shall provide a file upload interface accepting `.csv` files up to 5 MB in size.
- **FR-08 (Mandatory):** The system shall validate that the uploaded CSV contains a recognized text column (e.g., `message`, `text`, `sms_text`, or the first string column).
- **FR-09 (Mandatory):** The system shall process each row through the identical NLP preprocessing and inference pipeline.
- **FR-10 (Mandatory):** The system shall display a processing summary showing total messages processed, count of Ham detected, and count of Spam detected.
- **FR-11 (Mandatory):** The system shall render a paginated or scrollable table preview of the top 10 classified records.
- **FR-12 (Mandatory):** The system shall provide a "Download Results CSV" button that generates a CSV containing the original text, cleaned text, predicted label, and confidence score.

### Module 3: Analytics & Model Evaluation
- **FR-13 (Mandatory):** The system shall provide an Analytics view displaying dataset metrics (total records, ham/spam percentage, average message length).
- **FR-14 (Mandatory):** The system shall render interactive charts (using Chart.js) depicting the class distribution and length comparisons.
- **FR-15 (Mandatory):** The system shall display the evaluation performance of the candidate models (Multinomial Naive Bayes vs. Logistic Regression), including Precision, Recall, and F1-Scores.
- **FR-16 (Mandatory):** The system shall display the Confusion Matrix for the deployed model on the test split.

---

## 5. Non-Functional Requirements (NFR)

- **NFR-01 (Performance - Single Prediction):** Single SMS inference API response time shall be under 200 ms under normal local development conditions.
- **NFR-02 (Performance - Bulk Processing):** Bulk processing of 1,000 SMS messages shall complete within 3 seconds on standard consumer PC hardware.
- **NFR-03 (Usability & Responsiveness):** The web user interface shall be fully responsive across desktop viewports (1024px and wider) and mobile viewports (375px to 768px).
- **NFR-04 (Reliability & Fault Tolerance):** An unhandled exception or malformed input must never crash the Flask server process; the API must return a structured JSON error response with an appropriate HTTP status code (4xx/5xx).
- **NFR-05 (Security & Input Sanitization):** Uploaded CSV files must be processed in memory or securely deleted from temporary storage immediately after inference. Raw user inputs must never be rendered using unsafe HTML injection methods (`innerHTML`).
- **NFR-06 (Maintainability & Test Coverage):** Core NLP, model loading, and API endpoints must achieve at least 80% automated unit test coverage via Pytest.

---

## 6. MVP vs. Optional Features

| Feature Scope | Feature Description | Tier |
| :--- | :--- | :--- |
| **MVP (Must Have)** | Single SMS input, cleaning, classification, and confidence scoring | **Mandatory** |
| **MVP (Must Have)** | Bulk CSV upload, batch inference, summary counts, and CSV download | **Mandatory** |
| **MVP (Must Have)** | Baseline ML model (Multinomial Naive Bayes) with fitted TF-IDF | **Mandatory** |
| **MVP (Must Have)** | Dataset distribution charts and evaluation metrics panel (Chart.js) | **Mandatory** |
| **MVP (Must Have)** | Error handling for invalid inputs and oversized files | **Mandatory** |
| **Phase 2 (Nice to Have)** | Logistic Regression side-by-side model selector in UI | **Optional** |
| **Phase 2 (Nice to Have)** | Highlighted keywords / explainability tokens in single prediction UI | **Optional** |
| **Out of Scope** | User login / authentication system | Excluded |
| **Out of Scope** | Relational database (PostgreSQL/MySQL) setup | Excluded |
| **Out of Scope** | Real-time SMS gateway or mobile carrier integration | Excluded |

---

## 7. Success Criteria

1. **Academic Evaluation Success:** The project passes the B.Tech CSE evaluation rubric with 100% working live demonstration during the viva.
2. **Model Performance Target:** Achieve an F1-Score of $\ge 0.90$ on the test split for the Spam minority class, while maintaining high Precision ($\ge 0.95$) to prevent legitimate messages from being misclassified as spam (minimizing False Positives).
3. **Execution Reliability:** Zero uncaught server crashes during stress testing with diverse sample messages and corrupt CSV inputs.
