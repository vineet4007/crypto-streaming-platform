FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src

ENV SERVICE_NAME=query-service
ENV LOG_LEVEL=info

EXPOSE 3000

CMD ["node", "src/index.js"]
