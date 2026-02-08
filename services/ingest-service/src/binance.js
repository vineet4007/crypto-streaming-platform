const WebSocket = require("ws");
const logger = require("./logger");
const { publishTrade } = require("./kafka");

function startBinanceStream() {
  const ws = new WebSocket(
    "wss://stream.binance.com:9443/ws/btcusdt@trade"
  );

  ws.on("open", () => {
    logger.info({ event: "ws_connected" }, "Binance WS connected");
  });

  ws.on("message", async (data) => {
    const msg = JSON.parse(data.toString());

    const trade = {
      symbol: msg.s,
      price: parseFloat(msg.p),
      quantity: parseFloat(msg.q),
      tradeId: msg.t,
      eventTime: msg.T,
      source: "binance"
    };

    await publishTrade(trade);
  });

  ws.on("error", (err) => {
    logger.error({ event: "ws_error", err }, "WebSocket error");
  });
}

// const logger = require("./logger");

function handleTrade(trade) {
  logger.info({
    event: "binance_trade_received",
    symbol: trade.s,
    price: trade.p,
    ts: trade.T
  });

  return {
    symbol: trade.s,
    price: Number(trade.p),
    ts: trade.T
  };
}

module.exports = { handleTrade };

module.exports = { startBinanceStream };
