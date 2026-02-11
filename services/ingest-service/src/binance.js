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

  ws.on("message", async (msg) => {
    const data = JSON.parse(msg.toString());
    if (!data || !data.s || !data.p) return;
    const trade = {
      symbol: data.s,
      price: parseFloat(data.p),
      quantity: parseFloat(data.q),
     // tradeId: data.t,
      // eventTime: data.E,
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
    ts: trade.E
  });

  return {
    symbol: trade.s,
    price: Number(trade.p),
    ts: trade.T
  };
}

module.exports = {
  startBinanceStream,
  handleTrade
};

