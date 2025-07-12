FROM node:22.16.0

# Install dependencies
RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  webp && \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

# Upgrade npm to the specific version 11.4.2
RUN npm install -g npm@11.4.2

WORKDIR /test

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

# Install node modules
RUN npm install

# Copy the rest of the app
COPY . .

# Run the app
CMD ["npm", "start"]
