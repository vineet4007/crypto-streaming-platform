const Parser = require("rss-parser");
const parser = new Parser();

const RSS_URL = "https://www.investing.com/rss/news_285.rss";

async function fetchNews() {
  const feed = await parser.parseURL(RSS_URL);

  return feed.items.map(item => ({
    title: item.title,
    link: item.link,
    publishedAt: item.pubDate,
    source: "investing.com",
    category: "economic_news",
  }));
}

module.exports = { fetchNews };
