const logger = require("pino")();
const { startProducer, publishNews } = require("./kafka");
const { fetchNews } = require("./rssFetcher");

const POLL_INTERVAL_MS = 60_000; // 1 minute

async function run() {
  logger.info("event=service_start service=news-ingest");

  await startProducer();
  logger.info("event=kafka_connected");

  setInterval(async () => {
    try {
      const newsItems = await fetchNews();

      for (const news of newsItems) {
        await publishNews({
          ...news,
          ingestedAt: Date.now(),
        });
      }

      logger.info({
        event: "news_published",
        count: newsItems.length,
      });
    } catch (err) {
      logger.error(
        { err },
        "event=news_ingest_failed"
      );
    }
  }, POLL_INTERVAL_MS);
}

run();
