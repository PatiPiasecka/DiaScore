
# Dockerfile for DiaScore Frontend (React + Vite)

# This is a "multi-stage" build — it uses two separate images:
#   Stage 1: Build the React app (generates static files)
#   Stage 2: Serve those files with nginx (lightweight web server)

# Build
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files first
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy all source code
COPY . .

# The API URL will be set at build time via docker-compose
# Default to the Docker service name
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the production bundle
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built files from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
