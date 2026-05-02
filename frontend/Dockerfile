# STAGE 1: Build the React application
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Builds the static files 
RUN npm run build 

# STAGE 2: Serve with Nginx
FROM nginx:alpine
# Remove default Nginx welcome page files
RUN rm -rf /usr/share/nginx/html/*
# Copy the built assets from Stage 1 into the Nginx server directory
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose HTTP port
EXPOSE 80
# Run Nginx in the foreground so the container doesn't exit
CMD ["nginx", "-g", "daemon off;"]