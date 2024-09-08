# Usa una imagen base de Node.js con una versión específica
FROM node:20-slim

# Establece variables de entorno
ENV NODE_ENV=production

# Instala las dependencias necesarias para compilar Argon2
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias
RUN npm ci --only=production

# Copia el resto de los archivos del proyecto
COPY . .

# Crea un usuario no root
RUN useradd -r -u 1001 -g root nonroot
RUN chown -R nonroot:root /usr/src/app
USER nonroot

# Expone el puerto en el que se ejecutará la aplicación
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "src/app.js"]