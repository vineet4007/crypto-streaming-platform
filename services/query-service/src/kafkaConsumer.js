const { Kafka } = require("kafkajs");
const logger = require("./logger");
const brokers = [process.env.KAFKA_BROKER || "kafka:29092"];
const kafka = new Kafka({
  clientId: "query-service",
  brokers
});

const consumer = kafka.consumer({
  groupId: "query-service"
});

const latestPrices = new Map();

async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({
    topic: "raw.trades",
    fromBeginning: true
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const trade = JSON.parse(message.value.toString());
      latestPrices.set(trade.symbol, trade.price);
    }
  });

  logger.info({ event: "consumer_started" }, "Kafka consumer started");
}

function getLatestPrice(symbol) {
  return latestPrices.get(symbol);
}

module.exports = {
  startConsumer,
  getLatestPrice
};
