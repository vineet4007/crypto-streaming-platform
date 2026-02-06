const express = require("express");
const logger = require("./logger");

const app = express();

app.get("/health", (req, res) => {
  logger.info({ event: "health_check" }, "health ok");
  res.json({ status: "ok" });
});

module.exports = app;
