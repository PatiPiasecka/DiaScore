
# Dockerfile for DiaScore API (FastAPI + PyTorch)

# Start from a Python 3.13 image
FROM python:3.13-slim

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies needed by some Python packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files first
COPY pyproject.toml uv.lock ./

# Install dependencies (torch CPU-only instead of full CUDA version from lockfile)
RUN uv venv && \
    uv export --frozen --no-dev --no-hashes > requirements.txt && \
    grep -v "^torch==" requirements.txt > requirements_no_torch.txt && \
    uv pip install torch --index-url https://download.pytorch.org/whl/cpu && \
    uv pip install -r requirements_no_torch.txt

# Copy the rest of the project code
COPY api/ ./api/
COPY database/ ./database/
COPY ml/ ./ml/
COPY data/ ./data/
COPY conftest.py ./

# Expose port 8000 (the port FastAPI runs on)
EXPOSE 8000

# Add the venv to PATH so uvicorn is called directly from the installed environment.
# Using the venv directly (instead of 'uv run') prevents uv from re-resolving
# and re-downloading packages (like torch) on every container startup.
ENV PATH="/app/.venv/bin:$PATH"

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
