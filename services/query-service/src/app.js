const express = require("express");
const logger = require("./logger");
const redis = require('./redis')
const app = express();

app.get("/price/:symbol", async (req, res) => {
  const symbol = req.params.symbol;
  const price = await redis.get(symbol);

  if (!price) {
    logger.warn({
      event: "price_not_found",
      symbol
    });
    return res.status(404).json({ error: "price not available" });
  }

  logger.info({
    event: "price_served",
    symbol,
    price: Number(price)
  });

  res.json({ symbol, price: Number(price) });
});

app.get("/health", (req, res) => {
  logger.info({ event: "health_check" }, "health ok");
  res.json({ status: "ok" });
});

module.exports = app;
