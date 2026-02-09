package com.crypto.processor;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.errors.WakeupException;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

import org.apache.kafka.common.TopicPartition;
import java.time.Duration;
import java.util.Collection;


public class KafkaConsumerRunner {

    private static final Logger logger = LoggerFactory.getLogger(KafkaConsumerRunner.class);
    private final Map<TopicPartition, OffsetAndMetadata> currentOffsets = new ConcurrentHashMap<>();

    private final KafkaConsumer<String, String> consumer;
    private final RedisWriter redisWriter;
    private final ObjectMapper objectMapper;
    private final AtomicBoolean running = new AtomicBoolean(true);

    public KafkaConsumerRunner(String brokers, RedisWriter redisWriter) {
        this.redisWriter = redisWriter;
        this.objectMapper = new ObjectMapper();

        Properties props = new Properties();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, brokers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "stream-processor");

        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG,
                StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG,
                StringDeserializer.class.getName());

        // 🔒 Correctness & performance
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "500");
        props.put("allow.auto.create.topics", "false");

        this.consumer = new KafkaConsumer<>(props);
    }

    public void start() {
        logger.info("Kafka consumer starting");

    consumer.subscribe(
    Collections.singletonList("raw.trades"),
    new ConsumerRebalanceListener() {

        @Override
        public void onPartitionsRevoked(Collection<TopicPartition> partitions) {
            logger.info("partitions revoked {}", partitions);

            // commit processed offsets before losing partitions
            consumer.commitSync(currentOffsets);
        }

        @Override
        public void onPartitionsAssigned(Collection<TopicPartition> partitions) {
            logger.info("partitions assigned {}", partitions);
        }
    }
);


        try {
            while (running.get()) {
                ConsumerRecords<String, String> records =
                        consumer.poll(Duration.ofMillis(1000));

                if (records.isEmpty()) {
                    continue;
                }

                for (ConsumerRecord<String, String> record : records) {
                    Trade trade = objectMapper.readValue(record.value(), Trade.class);
                   redisWriter.writeLatestPrice(
                      trade.getSymbol(),
                     trade.getPrice(),
                     trade.getTs());
                }

                consumer.commitAsync((offsets, exception) -> {
                    if (exception != null) {
                        logger.error("Async offset commit failed", exception);
                    }
                });
            }
        } catch (WakeupException e) {
            logger.info("Kafka consumer wakeup signal received");
        } catch (Exception e) {
            logger.error("Unexpected consumer error", e);
        } finally {
            try {
                consumer.commitSync();
                logger.info("Final offset commit completed");
            } finally {
                consumer.close();
                logger.info("Kafka consumer closed");
            }
        }
    }

    public void shutdown() {
        running.set(false);
        consumer.wakeup();
    }
}
