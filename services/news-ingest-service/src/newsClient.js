import axios from "axios";
import { logger } from "./logger.js";

const API_KEY = process.env.NEWS_API_KEY;
const BASE_URL = "https://newsapi.org/v2/top-headlines";

export async function fetchNews() {
  if (!API_KEY) {
    throw new Error("NEWS_API_KEY not set");
  }

  const response = await axios.get(BASE_URL, {
    params: {
      category: "business",
      language: "en",
      pageSize: 5,
      apiKey: API_KEY
    }
  });

  logger.info(
    { count: response.data.articles.length },
    "event=news_fetched"
  );

  return response.data.articles.map(article => ({
    source: article.source.name || "unknown",
    headline: article.title,
    summary: article.description || "",
    symbols: [],                 // enrichment later
    published_at: Math.floor(new Date(article.publishedAt).getTime() / 1000),
    url: article.url,
    sentiment_hint: "unknown"
  }));
}
