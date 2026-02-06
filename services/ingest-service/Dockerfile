FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY src ./src

ENV SERVICE_NAME=ingest-service
ENV LOG_LEVEL=info

CMD ["node", "src/index.js"]
