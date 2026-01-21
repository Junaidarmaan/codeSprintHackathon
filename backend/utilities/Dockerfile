# ===============================
# Stage 1: Build the application
# ===============================
FROM maven:3.9.6-amazoncorretto-21 AS build

# Set working directory
WORKDIR /app

# Copy Maven configuration first (better layer caching)
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Download dependencies (offline mode)
RUN chmod +x mvnw && ./mvnw dependency:go-offline

# Copy source code
COPY src src

# Build Spring Boot jar
RUN ./mvnw clean package -DskipTests


# ===============================
# Stage 2: Run the application
# ===============================
FROM amazoncorretto:21-alpine

# Set working directory
WORKDIR /app

# Copy the built JAR from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose Spring Boot port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
