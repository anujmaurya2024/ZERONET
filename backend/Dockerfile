# Stage 1: Build the Spring Boot Application
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Production JRE Image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/zeronet-backend-1.0.0.jar app.jar

ENV PORT=3001
EXPOSE 3001

CMD ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
