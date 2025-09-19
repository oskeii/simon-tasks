FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=backend.settings

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \ 
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project (Done after dependencies so code changes don't invalidate dependency cache)
COPY . .

EXPOSE 8000

# Default command to run when container starts (overridden by docker-compose)
CMD [ "python", "manage.py", "runserver", "0.0.0.0:8000" ]
# 0.0.0.0 instead of 127.0.0.1 because container needs to accept external connections