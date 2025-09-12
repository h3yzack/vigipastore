FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY build/libs/vault-service.jar vault-service.jar

ENTRYPOINT ["java","-jar","/app/vault-service.jar"]