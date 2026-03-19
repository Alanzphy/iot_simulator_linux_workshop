# Usar una imagen oficial de Node.js súper ligera
FROM node:20-alpine

# Crear el directorio de trabajo
WORKDIR /app

# Copiar los archivos al contenedor
COPY package.json server.js ./

# Exponer el puerto que usa nuestro server.js
EXPOSE 5111

# Comando para iniciar el servidor
CMD ["npm", "start"]