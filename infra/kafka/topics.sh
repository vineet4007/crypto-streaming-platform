#!/bin/bash
set -e

BOOTSTRAP_SERVER="localhost:9092"

create_topic () {
  local TOPIC=$1
  local PARTITIONS=$2
  local RETENTION_MS=$3

  kafka-topics \
    --bootstrap-server $BOOTSTRAP_SERVER \
    --create \
    --if-not-exists \
    --topic $TOPIC \
    --partitions $PARTITIONS \
    --replication-factor 1 \
    --config retention.ms=$RETENTION_MS
}

echo "Creating Kafka topics..."

# Raw topics (high volume, short retention)
create_topic raw.trades 8 86400000
create_topic raw.tickers 8 86400000

# Processed topics (lower volume, longer retention)
create_topic processed.candles 4 604800000
create_topic processed.metrics 4 604800000

echo "Kafka topics created successfully."
