# Crypto Streaming Platform

A real-time crypto market data platform built using:
- WebSocket market feeds
- Kafka-based event streaming
- Java stream processing
- Node.js I/O services
- Postgres + Redis

## Architecture
- Ingest → Kafka → Process → Kafka → Persist → Cache → Query

## Services
- ingest-service (Node.js)
- stream-processor (Java)
- persistence-service (Java)
- cache-service (Node.js)
- query-service (Node.js)

## Status
🚧 Initial scaffolding
