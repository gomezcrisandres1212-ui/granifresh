# Etapa de compilación
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Etapa de ejecución liviana
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Render asigna dinámicamente la variable de entorno PORT
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]
