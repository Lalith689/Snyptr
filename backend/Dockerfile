FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY . .

# Copy model files from parent directory
COPY ../best_model.h5 .
COPY ../stance_error_model.h5 .

# Set Flask environment
ENV FLASK_ENV=production

# Expose port
EXPOSE 8080

# Run Flask app
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "server:app"]
