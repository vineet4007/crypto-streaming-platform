const express = require("express");
const logger = require("./logger");
const redis = require('./redis')
const app = express();

app.get("/price/:symbol", async (req, res) => {
  const symbol = req.params.symbol;
  const rawValue = await redis.get(`price:${symbol}`);

  if (!rawValue) {
    logger.warn({
      event: "price_not_found",
      symbol
    });
    return res.status(404).json({ error: "price not available" });
  }

  const [pricePart, tsPart] = rawValue.split("|");
  const price = Number(pricePart);

  if (!Number.isFinite(price)) {
    logger.warn({
      event: "price_parse_failed",
      symbol,
      rawValue
    });
    return res.status(404).json({ error: "price not available" });
  }

  logger.info({
    event: "price_served",
    symbol,
    price,
    ts: tsPart ? Number(tsPart) : undefined
  });

  res.json({ symbol, price });
});

app.get("/health", (req, res) => {
  logger.info({ event: "health_check" }, "health ok");
  res.json({ status: "ok" });
});

module.exports = app;
