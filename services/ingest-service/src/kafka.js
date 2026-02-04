const { Kafka } = require("kafkajs");
const logger = require("./logger");

const kafka = new Kafka({
  clientId: "ingest-service",
  brokers: ["localhost:9092"]
});

const producer = kafka.producer();

async function connectProducer() {
  await producer.connect();
  logger.info({ event: "kafka_connected" }, "Kafka producer connected");
}

async function publishTrade(trade) {
  await producer.send({
    topic: "raw.trades",
    messages: [
      {
        key: trade.symbol,
        value: JSON.stringify(trade)
      }
    ]
  });
}

module.exports = {
  connectProducer,
  publishTrade
};
