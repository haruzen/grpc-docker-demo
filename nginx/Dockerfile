FROM nginx:latest

# Copy NGINX config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy frontend files
COPY frontend /usr/share/nginx/html/frontend

# Optional: Copy SSL certs (or mount as volume instead)
#COPY nginx/ssl/selfsigned.crt /etc/nginx/ssl/selfsigned.crt
#COPY nginx/ssl/selfsigned.key /etc/nginx/ssl/selfsigned.key

# Expose standard web ports
EXPOSE 80 443
