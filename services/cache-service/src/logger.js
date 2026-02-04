const pino = require("pino");

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: { service: "cache-service" },
  timestamp: () => `,"timestamp":"${new Date().toISOString()}"`
});

module.exports = logger;
