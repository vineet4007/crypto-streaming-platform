package com.crypto.processor;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.errors.WakeupException;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.Duration;
import java.util.Collections;
import java.util.Properties;

public class KafkaConsumerRunner {

    private static final Logger logger =
            LoggerFactory.getLogger(KafkaConsumerRunner.class);

    private final KafkaConsumer<String, String> consumer;
    private final RedisWriter redisWriter;
    private final ObjectMapper objectMapper;
    private volatile boolean running = true;

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

        // 🔒 Critical correctness settings
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "latest");
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, "500");

        this.consumer = new KafkaConsumer<>(props);
    }

    public void start() {
        logger.info("Kafka consumer starting");
        consumer.subscribe(Collections.singletonList("raw.trades"));

        try {
            while (running) {
                ConsumerRecords<String, String> records =
                        consumer.poll(Duration.ofMillis(500));

                if (records.isEmpty()) {
                    continue;
                }

                for (ConsumerRecord<String, String> record : records) {
                    processRecord(record);
                }

                // ✅ commit only after all records processed successfully
                consumer.commitSync();
            }
        } catch (WakeupException e) {
            // Expected during shutdown
            logger.info("Kafka consumer wakeup");
        } catch (Exception e) {
            // Unexpected failure — log but do not hide
            logger.error("Unexpected error in Kafka consumer loop", e);
        } finally {
            consumer.close();
            logger.info("Kafka consumer closed");
        }
    }

    private void processRecord(ConsumerRecord<String, String> record) {
        try {
            Trade trade = objectMapper.readValue(record.value(), Trade.class);

            redisWriter.writeLatestPrice(
                    trade.getSymbol(),
                    trade.getPrice(),
                    trade.getTs()
            );

        } catch (Exception e) {
            logger.error(
                    "Failed to process record. Will retry. topic={}, partition={}, offset={}",
                    record.topic(),
                    record.partition(),
                    record.offset(),
                    e
            );

            /*
             * ❗ IMPORTANT
             * - We do NOT throw
             * - We do NOT commit
             * - Kafka will retry this record on next poll
             * - Other partitions continue processing
             */
        }
    }

    public void shutdown() {
        running = false;
        consumer.wakeup();
    }
}
