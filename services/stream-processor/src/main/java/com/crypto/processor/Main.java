package com.crypto.processor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Main {

    private static final Logger logger = LoggerFactory.getLogger(Main.class);

    public static void main(String[] args) {
        logger.info("stream-processor starting");

        String kafkaBrokers = getEnv("KAFKA_BROKER", "kafka:29092");
        String redisHost = getEnv("REDIS_HOST", "redis");
        int redisPort = Integer.parseInt(getEnv("REDIS_PORT", "6379"));

        logger.info("Kafka broker: {}", kafkaBrokers);
        logger.info("Redis: {}:{}", redisHost, redisPort);

        RedisWriter redisWriter = new RedisWriter(redisHost, redisPort);
        KafkaConsumerRunner consumerRunner =
                new KafkaConsumerRunner(kafkaBrokers, redisWriter);

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            logger.info("shutdown signal received");
            consumerRunner.shutdown();
            redisWriter.shutdown();
        }));

        consumerRunner.start();
    }

    private static String getEnv(String key, String defaultValue) {
        String value = System.getenv(key);
        return (value == null || value.isEmpty()) ? defaultValue : value;
    }
}
