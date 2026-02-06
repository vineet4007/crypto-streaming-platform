const app = require("./app");
const logger = require("./logger");
const { startConsumer, getLatestPrice } = require("./kafkaConsumer");

const PORT = 3000;

app.get("/price/:symbol", (req, res) => {
  const price = getLatestPrice(req.params.symbol);
  if (!price) {
    return res.status(404).json({ error: "price not available" });
  }
  res.json({ symbol: req.params.symbol, price });
});

async function start() {
  logger.info({ event: "startup" }, "query-service starting");

  await startConsumer();

  app.listen(PORT, () => {
    logger.info(
      { event: "listening", port: PORT },
      "query-service listening"
    );
  });
}

start().catch((err) => {
  logger.error({ event: "fatal", err }, "query-service failed");
  process.exit(1);
});
