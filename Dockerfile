# Usar la imagen oficial de Nginx basada en Debian (la versión por defecto)
FROM nginx

# Elimina los archivos de bienvenida por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia tu sitio al directorio público de Nginx
COPY . /usr/share/nginx/html

# Expone el puerto web (buena práctica para documentación)
EXPOSE 80