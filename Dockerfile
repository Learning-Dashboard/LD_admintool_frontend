# ============================================
# Dockerfile para LD Admin Tool Frontend
# ============================================
# Aplicación React + Vite

# ============================================
# Etapa 1: Build
# ============================================
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Capturar el argumento pasado desde docker-compose
ARG VITE_API_URL

# Convertirlo en variable de entorno para que el build de Vite lo vea
ENV VITE_API_URL=$VITE_API_URL

# Debug en el log del build
RUN echo "Building Frontend with VITE_API_URL=${VITE_API_URL}"

# Build de producción
RUN npm run build

# ============================================
# Etapa 2: Producción con Nginx
# ============================================
FROM nginx:alpine

# Crear la subcarpeta que coincide con la URL base
RUN mkdir -p /usr/share/nginx/html/admin-tool

# Copiar archivos compilados
COPY --from=build /app/dist /usr/share/nginx/html/admin-tool

# Configuración de Nginx para SPA con proxy al backend
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Proxy para peticiones al backend \
    location /admin-tool/api/ { \
        proxy_pass http://admintool_backend:8080/api/; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
    \
    # Configuración para la subcarpeta /admin-tool/ \
    location /admin-tool/ { \
        alias /usr/share/nginx/html/admin-tool/; \
        try_files $uri $uri/ /admin-tool/index.html; \
    } \
    \
    # Redirigir la raíz a la admin tool (opcional) \
    location = / { \
        return 301 /admin-tool/; \
    } \
    \
    # SPA fallback \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Nginx se ejecuta en foreground por defecto
CMD ["nginx", "-g", "daemon off;"]
