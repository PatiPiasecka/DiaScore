# DiaScore

[![Python Version](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/downloads/)
[![Backend API](https://img.shields.io/badge/API-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![ML](https://img.shields.io/badge/ML-PyTorch-red.svg)](https://pytorch.org/)
[![Preprocessing](https://img.shields.io/badge/Preprocessing-scikit--learn-F7931E.svg)](https://scikit-learn.org/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb.svg)](https://react.dev/)
[![Database](https://img.shields.io/badge/Database-SQLite%20%2B%20SQLAlchemy-003B57.svg)](https://www.sqlite.org/)

DiaScore is a full-stack application for diabetes risk estimation.
It combines:

* FastAPI API layer
* PyTorch model inference
* scikit-learn preprocessing (KNN imputer and feature scaling)
* SQLite persistence
* React + Vite frontend

## Demo and Screenshots

Repository currently includes app logo and full Docker setup.
Demo video and UI screenshots can be attached in this section after running the stack locally.

Suggested captures:

* Main page
* Medical questionnaire
* Family interview section
* Prediction result below threshold
* Prediction result above threshold
* History page

## Project Scope

DiaScore is not only a web API. The core backend logic includes the ML model and preprocessing pipeline.
The project is built as an end-to-end system: data preparation, model training, inference, API integration, and UI for patient-facing prediction history.

## Main Features

* Predict diabetes risk from medical questionnaire values.
* Impute missing values before inference.
* Store prediction history in SQLite.
* Display history in the frontend and export results to CSV.
* Support single-record deletion and full history cleanup.

## Run with Docker

The project should be run through Docker Compose (not by starting frontend and backend separately).

### Requirements

* Docker
* Docker Compose plugin

### Build images

```bash
docker compose build
```

### Start the full stack

```bash
docker compose up
```

Or build and start in one command:

```bash
docker compose up --build
```

### Access services

* Frontend: http://localhost:3000
* API: http://localhost:8000

### Stop services

```bash
docker compose down
```

## Our Model

DiaScore uses a binary classification neural network implemented in PyTorch and trained on the Pima Indians Diabetes dataset.
Before inference, missing clinical values are imputed (KNN imputer), then scaled with StandardScaler.

Model details, intended use, metrics and trade-offs are documented in:

* [Model Card](docs/model_card.md)

Related ML notebooks:

* [Data analysis notebook](ml/notebooks/00_data_analysis.ipynb)
* [Data exploration and split notebook](ml/notebooks/01_data_exploration.ipynb)

## Project Structure

* `api/` - FastAPI app and endpoint schemas
* `database/` - SQLAlchemy models, CRUD, preprocessing, database scripts
* `frontend/` - React and Vite user interface
* `ml/` - model training, evaluation and inference code
* `data/` - dataset and split utilities
* `docs/` - project documentation, including model card

## Authors

* Patrycja Piasecka ([PatiPiasecka](https://github.com/PatiPiasecka))
* Patrycja Zborowska ([loschrix](https://github.com/loschrix))