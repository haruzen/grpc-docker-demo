# Base NGINX image
FROM nginx:alpine

# Remove the default config to avoid conflicts
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom config file
COPY default.conf /etc/nginx/conf.d/default.conf

# Optional: Add health check tool or curl for debug (not installed by default)
RUN apk add --no-cache curl

# Optional: Add static assets (e.g., HTML, JS, CSS) if serving UI
# COPY ./public /usr/share/nginx/html

# Expose port 80 (already default in base image, but explicit is clear)
EXPOSE 80
