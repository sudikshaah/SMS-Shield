# 16. Technical Glossary & Concept Definitions

> **Document Status:** `PROPOSED` Baseline  
> **Project ID:** NLP-04  
> **Product Working Title:** SMS Shield  
> **Target Audience:** Beginner team members, students, and viva evaluators

---

## A

### API (Application Programming Interface)
A formal software contract that allows two computer programs to communicate with each other over a network. In SMS Shield, the Flask backend exposes REST API endpoints that receive JSON text requests from the web browser and return classification predictions.

---

## B

### Bag of Words (BoW)
A simplified representation of text where a document is represented as the bag (multiset) of its words, disregarding grammar, punctuation, and word order, but keeping track of word frequencies.

### Binary Classification
A machine learning task where each input instance is categorized into exactly one of two mutually exclusive classes. In this project, the two classes are **HAM** (0) and **SPAM** (1).

---

## C

### Class Imbalance
A situation in machine learning where the number of examples in one class vastly exceeds the examples in another class. In SMS datasets, Ham typically accounts for 85–87% of all records while Spam accounts for only 13–15%.

### Confusion Matrix
A 2x2 table used to evaluate the performance of a binary classification model by comparing actual ground-truth labels against predicted labels:
- **True Positive (TP):** Spam correctly predicted as Spam.
- **True Negative (TN):** Ham correctly predicted as Ham.
- **False Positive (FP):** Ham mistakenly predicted as Spam (*Type I Error*).
- **False Negative (FN):** Spam mistakenly predicted as Ham (*Type II Error*).

### CSV (Comma-Separated Values)
A standard tabular plain-text file format where each line represents a data record, and fields within that record are separated by commas (or tabs).

---

## E

### EDA (Exploratory Data Analysis)
The process of inspecting, visualizing, and summarizing the statistical characteristics of a dataset before applying machine learning algorithms.

---

## F

### F1-Score
The harmonic mean of Precision and Recall:
$$\text{F1} = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$
It provides a balanced single metric when evaluating datasets with significant class imbalance.

### False Negative (FN)
A test instance where the model predicts Ham, but the message was actually Spam.

### False Positive (FP)
A test instance where the model predicts Spam, but the message was actually legitimate Ham. In SMS filtering, False Positives are considered high-cost errors.

### Flask
A lightweight, micro web application framework written in Python. It provides request routing, template rendering, and JSON serialization without forcing complex dependencies.

---

## J

### Joblib
A Python library optimized for pipelining and saving/loading large Python objects containing NumPy arrays and Scikit-learn models to and from disk efficiently.

---

## L

### Logistic Regression
A linear supervised learning algorithm that models the probability of a binary outcome using the logistic sigmoid function:
$$P(Y=1 \mid X) = \frac{1}{1 + e^{-(\beta_0 + \beta_1 X)}}$$

---

## M

### Multinomial Naive Bayes (MNB)
A probabilistic classification algorithm based on Bayes' Theorem:
$$P(C \mid X) = \frac{P(X \mid C) \cdot P(C)}{P(X)}$$
It calculates the likelihood of an SMS belonging to a class based on the frequencies of its individual words, assuming conditional independence between features given the class.

---

## N

### Negation Preservation
An NLP preprocessing technique where negative terms (such as `not`, `no`, `never`, `cannot`) are intentionally kept in the text rather than deleted by generic stopword filters, preserving the sentence's negative meaning.

### NLP (Natural Language Processing)
A branch of Artificial Intelligence and Computational Linguistics that enables computers to understand, interpret, clean, and manipulate human language.

---

## P

### Precision
The proportion of predicted Spam messages that were genuinely Spam:
$$\text{Precision} = \frac{\text{TP}}{\text{TP} + \text{FP}}$$
High precision means the system rarely flags legitimate Ham messages as Spam.

---

## R

### Recall (Sensitivity)
The proportion of actual Spam messages that the model successfully caught:
$$\text{Recall} = \frac{\text{TP}}{\text{TP} + \text{FN}}$$
High recall means the system lets very few spam messages slip through.

### Regular Expressions (Regex)
A powerful sequence of characters defining a search pattern. In SMS Shield, regex patterns are used to detect and replace URLs, phone numbers, and special symbols during text cleaning.

---

## S

### Stopwords
High-frequency words in a language (such as "the", "is", "at", "which") that carry minimal discriminative semantic meaning for topic classification and are often filtered out to reduce noise.

### Stratified Train-Test Split
Splitting a dataset into training and testing subsets such that both subsets contain the exact same percentage of each target class as the original complete dataset.

### Supervised Learning
A machine learning paradigm where the algorithm is trained on a labeled dataset consisting of input features paired with their correct output classifications.

---

## T

### TF-IDF (Term Frequency-Inverse Document Frequency)
A numerical statistic that reflects how important a word is to a document in a collection. It scales up words that are frequent in a specific message but penalizes words that appear ubiquitously across all messages in the dataset.

### Tokenization
The NLP process of breaking a raw text stream or sentence into discrete semantic units, words, or symbols called "tokens".
