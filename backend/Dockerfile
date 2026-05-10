# Use a lightweight Node.js environment
FROM node:24-alpine

# Set the working directory inside the container
WORKDIR /

# Copy dependency definitions first (optimizes Docker layer caching)
COPY package*.json ./

# Use 'npm ci' instead of 'npm install' for a clean, deterministic build based on package-lock.json
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose the port your Express server runs on
EXPOSE 5000

# The command to start the backend
CMD ["npm", "start"]