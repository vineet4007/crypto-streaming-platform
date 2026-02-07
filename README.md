# 🚀 Crypto Streaming Platform

A **real-time, horizontally scalable crypto market data platform** built using **Kafka, Redis, Node.js, Java, and Docker**.

This project demonstrates how to ingest live market data, process it in parallel using Kafka consumer groups, and serve **low-latency price queries** via a stateless API.

This is **not a CRUD application** — it is a **distributed streaming system designed for scale**.

---

## 🧠 High-Level Architecture

```
Binance WebSocket
        |
        v
[ Ingest Service (Node.js) ]
        |
        v
   Kafka Topic (raw.trades, 8 partitions)
        |
        v
[ Stream Processor (Java, horizontally scalable) ]
        |
        v
      Redis (materialized view)
        |
        v
[ Query Service (Node.js REST API) ]
```

---

## 🏗️ Technology Choices & Rationale

### Why Kafka?

* High-throughput, durable event streaming
* Native support for **partition-based parallelism**
* Consumer groups enable horizontal scaling
* Industry standard for real-time pipelines

---

### Why Node.js for Ingest & Query?

**Node.js is used where I/O dominates computation.**

#### Ingest Service (Node.js)

* WebSocket-based I/O (Binance stream)
* Non-blocking event handling
* Lightweight and fast startup
* Ideal for network-heavy workloads

#### Query Service (Node.js)

* Stateless HTTP API
* Low CPU usage
* Simple concurrency model
* Excellent for read-heavy REST endpoints

👉 Node.js excels at **I/O-bound services**.

---

### Why Java for Stream Processing?

**Java is used where CPU, memory, and threading control matter.**

* Kafka’s native client is Java-first and most mature
* Better control over:

  * Threading
  * Backpressure
  * Memory usage
* More predictable performance under load
* Industry standard for high-throughput stream processing

👉 Java excels at **CPU-intensive, parallel data processing**.

This deliberate split mirrors **real production systems**.

---

## 🧩 Services Overview

### 1️⃣ Ingest Service (Node.js)

* Connects to **Binance WebSocket**
* Publishes trade events to Kafka
* Uses **symbol as Kafka message key** (`BTCUSDT`, `ETHUSDT`)
* Ensures deterministic partitioning

📁 `services/ingest-service`

---

### 2️⃣ Kafka

* Single-broker setup (demo-friendly)
* **Auto topic creation disabled**
* Topics created manually and explicitly
* `raw.trades` topic with **8 partitions**

Why this matters:

* Enables parallel consumption
* Preserves ordering per symbol
* Demonstrates intentional system design

---

### 3️⃣ Stream Processor (Java)

* Kafka consumer group: `stream-processor`
* Horizontally scalable via Docker
* Each instance consumes assigned partitions
* Writes **latest price per symbol** to Redis

📁 `services/stream-processor`

Scale consumers:

```bash
docker compose up -d --scale stream-processor=3
```

---

### 4️⃣ Redis

* Acts as a **materialized view**
* Stores latest price per symbol
* Enables sub-millisecond read latency
* Decouples reads from Kafka

---

### 5️⃣ Query Service (Node.js)

* Stateless REST API
* Reads directly from Redis
* No Kafka dependency

Example:

```http
GET /price/BTCUSDT
```

Response:

```json
{
  "symbol": "BTCUSDT",
  "price": 66398.85
}
```

📁 `services/query-service`

---

## 🔁 End-to-End Data Flow

1. Binance emits trade event
2. Ingest service publishes to Kafka
3. Kafka partitions events by symbol
4. Stream processors consume in parallel
5. Redis stores latest prices
6. Query service serves HTTP requests

---

## ⚙️ How to Run the Project (From Scratch)

### Prerequisites

* Docker
* Docker Compose
* Internet access (Binance WebSocket)

---

### 1️⃣ Clone the Repository

```bash
git clone <repo-url>
cd crypto-streaming-platform
```

---

### 2️⃣ Start Infrastructure & Services

```bash
docker compose up --build
```

---

### 3️⃣ Create Kafka Topic (Manual by Design)

Auto topic creation is disabled intentionally.

```bash
docker compose exec kafka kafka-topics \
  --bootstrap-server kafka:29092 \
  --create \
  --topic raw.trades \
  --partitions 8 \
  --replication-factor 1
```

---

### 4️⃣ Verify Data Flow

```bash
curl http://localhost:3000/price/BTCUSDT
```

If data exists:

```json
{ "symbol": "BTCUSDT", "price": 66410.01 }
```

If not yet processed:

```json
{ "error": "price not available" }
```

---

## 📈 Scalability Characteristics

* Producer scaling: add more ingest services
* Consumer scaling: scale `stream-processor`
* Partition-based parallelism
* Stateless services where possible
* Redis as a shared read-optimized store

---

## 🔍 Observability (ELK Stack)

* Filebeat ships Docker container logs
* Elasticsearch stores logs
* Kibana provides search and dashboards

Access Kibana:

```
http://localhost:5601
```

---

## 🚫 Intentional Design Decisions

* ❌ No Kafka auto-topic creation
* ❌ No database reads in query path
* ❌ No synchronous processing
* ❌ No shared mutable state

These decisions enforce:

* Correctness
* Scalability
* Predictable performance

---

## 🎯 Purpose of This Project

This project exists to demonstrate **real-world streaming system design**, not toy examples.

It showcases:

* Kafka partitioning strategy
* Consumer group scaling
* Java vs Node.js tradeoffs
* Real-time ingestion
* Low-latency querying
* Docker-based orchestration

---

## 🔮 Future Enhancements

* Multi-symbol ingestion (ETH, SOL)
* Metrics (consumer lag, throughput)
* Exactly-once semantics
* Historical storage
* Alerting & anomaly detection

---

## 👤 Author

**Vineet Chauhan**

 This system is designed to be **understood, explained, and scaled** — not just run.
