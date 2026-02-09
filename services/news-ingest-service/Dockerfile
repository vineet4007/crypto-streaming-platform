FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY src ./src

# ENV KAFKA_BROKER=kafka:29092

CMD ["node", "src/index.js"]
