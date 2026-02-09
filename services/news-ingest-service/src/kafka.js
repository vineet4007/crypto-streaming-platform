const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "news-ingest-service",
  brokers: [process.env.KAFKA_BROKER || "kafka:29092"],
});

const producer = kafka.producer();

async function startProducer() {
  await producer.connect();
}

async function publishNews(event) {
  await producer.send({
    topic: "news_events",
    messages: [
      {
        key: event.source || "news",
        value: JSON.stringify(event),
      },
    ],
  });
}

module.exports = { startProducer, publishNews };
