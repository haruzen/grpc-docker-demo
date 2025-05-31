# Use official Python 3.13.3 image from Docker Hub
FROM python:3.13.3-slim

# Set the working directory inside the container
WORKDIR /app

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Set the default command to run your app
CMD ["python", "server.py"]
