const { Kafka } = require("kafkajs");
const logger = require("./logger");

const brokers = [process.env.KAFKA_BROKER || "kafka:29092"];
const kafka = new Kafka({
  clientId: "ingest-service",
  brokers
});

const producer = kafka.producer();

async function connectProducer() {
  await producer.connect();
  logger.info({ event: "kafka_connected" }, "Kafka producer connected");
}

async function publishTrade(producer, trade) {
  const result = await producer.send({
    topic: "raw.trades",
    messages: [{
      key: trade.symbol,
      value: JSON.stringify(trade)
    }]
  });

  logger.info({
    event: "trade_published",
    symbol: trade.symbol,
    partition: result[0].partition,
    offset: result[0].baseOffset
  });
}

module.exports = {
  connectProducer,
  publishTrade
};
