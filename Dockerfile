# Use the official lightweight Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Copy dependencies
COPY requirements.txt .

# Install python packages
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browser and its OS-level dependencies
RUN playwright install chromium
RUN playwright install-deps chromium

# Copy the entire application
COPY . .

# Expose the application port
EXPOSE 8000

# Start the application
CMD ["python", "-m", "backend.main"]
