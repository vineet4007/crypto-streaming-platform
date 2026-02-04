const logger = require("./logger");
const { connectProducer } = require("./kafka");
const { startBinanceStream } = require("./binance");

async function start() {
  logger.info({ event: "startup" }, "ingest-service starting");

  await connectProducer();
  logger.info({ event: "kafka_connected" }, "Kafka producer connected");

  startBinanceStream();
}

start().catch((err) => {
  logger.error({ event: "fatal", err }, "ingest-service failed");
  process.exit(1);
}); 

logger.info(
  {
    event: "service_start",
    message: "ingest-service booted successfully"
  }
);
