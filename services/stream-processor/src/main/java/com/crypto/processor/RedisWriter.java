package com.crypto.processor;

import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class RedisWriter {

    private static final Logger logger =
            LoggerFactory.getLogger(RedisWriter.class);

    private final RedisClient redisClient;
    private final StatefulRedisConnection<String, String> connection;
    private final RedisCommands<String, String> commands;

    public RedisWriter(String host, int port) {
        String uri = String.format("redis://%s:%d", host, port);
        this.redisClient = RedisClient.create(uri);
        this.connection = redisClient.connect();
        this.commands = connection.sync();

        logger.info("connected to Redis at {}", uri);
    }

    public void writeLatestPrice(String symbol, double price, long ts) {
        String key = "price:" + symbol;
        String value = price + "|" + ts;

        commands.set(key, value);
    }

    public void shutdown() {
        logger.info("closing Redis connection");
        connection.close();
        redisClient.shutdown();
    }
}
