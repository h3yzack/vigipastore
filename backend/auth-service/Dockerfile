FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY build/libs/auth-service.jar auth-service.jar

ENTRYPOINT ["java","-jar","/app/auth-service.jar"]