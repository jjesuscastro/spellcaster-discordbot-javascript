FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

CMD ["sh", "-c", "node deploy-commands.js && node index.js"]
