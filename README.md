# Projekt-Python-2026
[![Python Version](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/downloads/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb.svg)](https://react.dev/)
[![Database](https://img.shields.io/badge/Database-SQLite%20%2B%20SQLAlchemy-003B57.svg)](https://www.sqlite.org/)

# 🌍 DiaScore - Diabetes Risk Prediction Platform

DiaScore is a full-stack web application for diabetes risk assessment. It combines a FastAPI backend, a React frontend and a machine-learning pipeline that predicts the risk score, stores prediction history and handles missing measurements through imputation.

The project is built as an end-to-end example of integrating medical-style form input, ML inference, a relational database and a modern web UI.

## ✨ Key Capabilities
* **🩺 Predict:** Submit patient measurements and receive a diabetes risk score in real time.
* **🧠 Impute:** Automatically fill missing measurements with the trained imputer when values are unavailable.
* **📚 Track:** Store prediction history per user and review previous analyses in the app.
* **📁 Export:** Download prediction history as CSV for further analysis.
* **🔗 Full Stack:** Use a React/Vite frontend, FastAPI API, SQLite database and a trained ML model together.

---

## 📖 Project Overview

### 🧾 User Flow
* The user opens the DiaScore frontend and fills in the medical form.
* Optional family-history details can be added through the interview panel.
* The frontend sends the payload to the FastAPI backend at `/predict/`.
* The backend imputes missing values, runs the ML model and stores the prediction in SQLite.
* The user can later open the history view to inspect previous predictions and export them to CSV.

### 🧬 Backend and ML Layer
* The API is built with FastAPI and SQLAlchemy.
* The backend loads a trained model and a serialized imputer from the `database/` directory.
* Prediction records are stored in SQLite in the `patient_predictions` table.
* Training data can be imported from `data/diabetes.csv` into the database.
* The ML layer lives in `ml/src/` and includes data loading, training, evaluation and prediction utilities.

### 🖥️ Frontend Layer
* The UI is built with React, Vite and React Router.
* The home page contains the medical form, family interview section and prediction result card.
* The history page shows previous predictions, highlights imputed values and supports CSV export.
* The frontend expects the API URL in `VITE_API_URL`.

### 🗃️ Data and Storage
* Training and reference data are kept in `data/`.
* The application database is stored locally as SQLite in `database/diabetes.db`.
* Serialized ML artifacts such as the imputer are stored alongside the backend files.

---

## 🚀 Features

### ⚙️ Prediction Workflow
* The app validates medical inputs before sending them to the API.
* Missing values are handled automatically where the field can be imputed.
* The response contains the risk score, diabetic-risk flag and the list of imputed fields.

### 📈 History View
* Every prediction is saved under a user-specific identifier.
* Users can browse earlier results in a table with dates and risk percentages.
* Imputed values are shown as `N/A` in the history table to make preprocessing transparent.

### 🧰 Development Tooling
* Python dependencies are managed with `uv` through `pyproject.toml`.
* The project includes automated tests for the API and database layer.
* The repository has linting and formatting checks configured in CI.

---

## 💻 Usage

### 🛠️ Technical Requirements
* Python 3.13
* Node.js with npm
* `uv` for Python dependency management

### ▶️ Running the Backend
1. Install dependencies:

```bash
uv sync
```

2. Start the FastAPI application:

```bash
uv run fastapi dev api/main.py
```

The API will be available on `http://localhost:8000`.

### ▶️ Running the Frontend
1. Install frontend dependencies:

```bash
cd frontend
npm install
```

2. Make sure the API URL is set in `frontend/.env`:

```bash
VITE_API_URL=http://localhost:8000
```

3. Start the Vite development server:

```bash
npm run dev
```

The frontend will be available on the local Vite port.

### 🧪 Optional Utilities
* Import the diabetes dataset into SQLite:

```bash
uv run python database/main.py
```

* Run the test suite:

```bash
uv run pytest -v
```

* Check formatting and linting:

```bash
uv run ruff check .
uv run ruff format --check .
```

---

## 📂 Project Structure

* `api/` - FastAPI entrypoint and request/response schemas.
* `database/` - SQLAlchemy models, CRUD helpers, preprocessing and database setup.
* `frontend/` - React/Vite UI for prediction input and history browsing.
* `ml/` - Training, evaluation and inference utilities for the diabetes model.
* `data/` - Source dataset and helper scripts for data preparation.

---

## 👥 Authors
* Patrycja Piasecka <img src="https://img.shields.io/badge/GitHub-PatiPiasecka-181717?logo=github" alt="GitHub">
* Patrycja Zborowska <img src="https://img.shields.io/badge/GitHub-loschrix-181717?logo=github" alt="GitHub">