# News Ingest Service

Polls external financial news APIs and publishes normalized events to Kafka.

## Kafka Topic
- `news.events`

## Responsibilities
- Periodic polling
- Schema normalization
- Kafka publishing
- Structured logging

## Non-Goals
- No prediction
- No sentiment scoring
- No persistence
