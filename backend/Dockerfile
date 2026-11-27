FROM maven:3.9.11-eclipse-temurin-21-alpine AS build
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline
COPY src/ src/
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:21-jre-alpine AS runtime
RUN addgroup -S uniwork && adduser -S -G uniwork uniwork
WORKDIR /app
COPY --from=build --chown=uniwork:uniwork /workspace/target/uniwork-api-0.1.0-SNAPSHOT.jar /app/app.jar
USER uniwork
EXPOSE 8080
# Render's free instance has 512 MiB. Keep a fixed heap ceiling so native JVM,
# Spring and bounded image decoding retain headroom for a 512 MiB container.
ENTRYPOINT ["java", "-Xms64m", "-Xmx256m", "-Xss512k", "-XX:MaxDirectMemorySize=32m", "-XX:+UseSerialGC", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar"]
