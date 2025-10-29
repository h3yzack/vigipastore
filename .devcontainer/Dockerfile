FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Set non-interactive
ENV DEBIAN_FRONTEND=noninteractive

# Install essential tools
RUN apt-get update && \
    apt-get install -y software-properties-common && \
    add-apt-repository ppa:deadsnakes/ppa && \
    apt-get update && \
    apt-get install -y \
        software-properties-common \
        build-essential \
        iputils-ping \
        curl \
        git \
        wget \
        unzip \
        lsb-release \
        sudo \
        libssl-dev \
        libffi-dev \
        pkg-config \
        cmake \
        libopaque-dev \
        libopaque0 \
        libopaque-bin \
    && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

USER vscode

# Set default shell
SHELL ["/bin/bash", "-c"]
