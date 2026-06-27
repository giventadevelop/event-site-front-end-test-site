# Dockerfile for Backend API Service
# This is a template - adjust based on your actual backend technology (Rust/Spring Boot/etc.)

# Multi-stage build for Java/Spring Boot backend
FROM openjdk:17-jdk-slim as builder

WORKDIR /app

# Copy Maven/Gradle files
COPY pom.xml .
COPY gradle* .
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests || ./gradlew build -x test

# Runtime stage
FROM openjdk:17-jre-slim

WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the built JAR file
COPY --from=builder /app/target/*.jar app.jar

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

# Alternative Dockerfile for Rust backend:
# FROM rust:1.70 as builder
# WORKDIR /app
# COPY . .
# RUN cargo build --release
#
# FROM debian:bullseye-slim
# RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
# WORKDIR /app
# COPY --from=builder /app/target/release/your-app-name .
# EXPOSE 8080
# CMD ["./your-app-name"]
