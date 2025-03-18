# Use the official Python image
FROM python:3.9

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app files
COPY . .

# Expose the port that Flask runs on
EXPOSE 8080

# Start the app using Gunicorn (better than Flask’s built-in server for production)
CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:app"]
