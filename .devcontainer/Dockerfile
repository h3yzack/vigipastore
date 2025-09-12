# Base devcontainer image
FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Install OpenJDK 17
RUN apt-get update && apt-get install -y openjdk-17-jdk

# Set JAVA_HOME environment variable
ENV JAVA_HOME /usr/lib/jvm/java-17-openjdk-arm64
ENV PATH $JAVA_HOME/bin:$PATH

# Set default shell
SHELL ["/bin/bash", "-c"]

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

