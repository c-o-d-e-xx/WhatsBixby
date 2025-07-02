FROM node:22.16.0
RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*
WORKDIR /test
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
