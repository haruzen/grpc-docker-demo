FROM nginx:latest

# Copy custom nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
# Copy static frontend files (now from /frontend)
COPY frontend /usr/share/nginx/html/frontend

EXPOSE 8080