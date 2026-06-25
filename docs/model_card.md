# Model Card: DiaScore (Diabetes Risk Prediction)

## Table of Contents
- [1. Model Details](#1-model-details)
- [2. Intended Use](#2-intended-use)
- [3. Preprocessing](#3-preprocessing)
- [4. Model Architecture](#4-model-architecture)
- [5. Training and Validation](#5-training-and-validation)
- [6. Evaluation Metrics](#6-evaluation-metrics)
- [7. Lessons Learned and Trade-offs](#7-lessons-learned-and-trade-offs)

---

## 1. Model Details
* **Developer(s):**
    - Patrycja Piasecka [[PatiPiasecka]](https://github.com/PatiPiasecka)
    - Patrycja Zborowska [[loschrix]](https://github.com/loschrix)
* **Model Date:** June 2026
* **Model Version:** 1.0.0
* **Model Type:** Binary Classification (Feedforward Neural Network)
* **Framework:** PyTorch
* **License:** MIT

## 2. Intended Use
* **Primary Use Case:** Estimating the probability of diabetes onset based on 8 standard medical diagnostic metrics. Designed to be integrated into the DiaScore API backend.
* **Intended Users:** Medical students, developers and researchers exploring ML healthcare integrations.
* **Out-of-Scope Use Cases:** This model is **not** a diagnostic tool. It should not be used to make final medical decisions or replace professional healthcare provider consultations.

## 3. Preprocessing
The model was trained on medical diagnostic records.
We use the [Pima Indians Diabetes Database](https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database).

### Why we chose this dataset?
First, we wanted to ensure data reliability by using one of the most popular datasets from verified medical sources.

The key factor for us was the amount and type of medical parameters. We did not want to force the end-user to fill out long and complicated medical forms.
Additionally, the selected parameters are highly relevant in the context of diabetes prediction.

Our only concern was the small number of records in the dataset -> [see: Size of the dataset](#size-of-the-dataset)

### The steps of data preparation:

1. Split the dataset into training (70%), validate (15%) and testing (15%) sets - used stratified splits to preserve the healthy/diabetic ratio [see: notebook](ml/notebooks/01_data_exploration.ipynb)

2. Imputed missing clinical values using KNN algorithm to estimate them based on patients with the most similar health profiles.

3. Scaled the numerical features using StandardScaler.

## 4. Model Architecture
* **Architecture:** Multi-layer perceptron (MLP) with a feedforward topology.
* **Layer Structure:** * **Input Layer:** 8 neurons (corresponding to the 8 standard clinical features).
    * **Hidden Layers:** * Layer 1: **32** neurons, followed by ReLU activation and Dropout.
        * Layer 2: **8** neurons, followed by ReLU activation and Dropout.
    * **Output Layer:** 1 neuron (producing raw logits for binary classification).
* **Regularization:** Applied `Dropout (p=0.3)` within hidden layers and weight decay (`1e-4`) in the optimizer to prevent overfitting on the limited dataset size.
* **Loss Function:** `BCEWithLogitsLoss`. Crucially, a specific `pos_weight` parameter (1.91) was applied to the loss function to counteract significant class imbalance.

## 5. Training and Validation
* **Training parameters:**
    * **Epochs:** 100
    * **Batch Size:** 32
    * **Optimizer:** Adam with a learning rate of 0.0005 and weight decay of `1e-4`
    * **Random Seed:** 1789 (applied globally across PyTorch, NumPy, and Python's `random` module to ensure strict reproducibility of the training pipeline).
* **Validation Strategy:** The model's generalization ability was monitored on a strictly isolated validation set (15% of the data) at the end of each epoch.

## 6. Evaluation Metrics
The model was evaluated on a strictly isolated test set. Due to the medical context, **Recall** was prioritized to minimize False Negatives.

| Metric | Value |
| :--- | :--- |
| **Accuracy** | *0.716* |
| **Precision** | *0.583* |
| **Recall** | *0.683* |

### Confusion Matrix Summary
* **True Positives (TP):** *28*
* **True Negatives (TN):** *55*
* **False Positives (FP):** *20*
* **False Negatives (FN):** *13*

## 7. Lessons Learned and Trade-offs

### 'Skin Thickness' parameter
Our database includes the skin thickness parameter, we use it to train our model but during the testing of our user interface we had a conclusion that a lot of users don't know the level of their skin thickness.
We didn't want to remove the parameter from the dataset because it could be unreliable, it impacts the outcome.
We decided to remove this parameter from the questionnaire, but estimate user skin thickness by KNN algorithm.

### 'DiabetesPedigreeFunction' parameter
The second parameter which could be a problem for the user is DiabetesPedigreeFunction. It is a factor of diabetes history in the user's family.
The minimum value of the factor is 0.078, maximum is 2.420.
We decided to implement a short interview with the user about his family, add weights to specific choices, and scale it between the minimum and maximum value.

### Size of the dataset
In our project, the main reason for choosing this dataset is a comfortable interface for the user. During the model implementation, we noticed that our dataset has a small count of records and it could be the main reason for the low level of our accuracy. The model can be better if our dataset has more records.

### False Negatives more important than accuracy
In the beginning, we chose the best model focusing on the best accuracy.
It is the most popular approach but we noticed that the count of 'False Negatives' is huge (23). In a medical project it is dangerous because it's better to tell a healthy patient that he is sick (he goes to the doctor and does additional tests) than telling a sick patient that he is healthy. In the end, we decided to choose the best model focusing on the lesser loss rather than higher accuracy. Our count of 'False Negatives' dropped to 13 but accuracy has a similar level to the previous one.
