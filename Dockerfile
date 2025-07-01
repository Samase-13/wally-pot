# Usamos una imagen ligera con Nginx
FROM nginx:alpine

# Elimina la configuración por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia tu sitio al directorio público de Nginx
COPY . /usr/share/nginx/html

# Exponemos el puerto web
EXPOSE 80