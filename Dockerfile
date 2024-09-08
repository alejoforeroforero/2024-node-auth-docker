# Usa una imagen base de Node.js
FROM node:20

# Instala las dependencias necesarias para compilar Argon2
RUN apt-get update && apt-get install -y build-essential python3

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia package.json y package-lock.json (si existe)
COPY package*.json ./

# Instala las dependencias
RUN npm ci

# Copia el resto de los archivos del proyecto
COPY . .

# Expone el puerto en el que se ejecutará la aplicación
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]