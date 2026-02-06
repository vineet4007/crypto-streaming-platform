FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

COPY target/stream-processor-0.1.0.jar app.jar

# Hard verification at build time
RUN jar tf app.jar | grep StaticLoggerBinder

ENV KAFKA_BROKER=kafka:29092
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379

CMD ["java", "-jar", "app.jar"]
