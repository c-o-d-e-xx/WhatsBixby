FROM node:18-slim
RUN apt-get update && \
    apt-get install -y git python3 build-essential && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
RUN git clone https://github.com/c-o-d-e-xx/WhatsBixby.git /Bixby

WORKDIR /APEX
RUN npm install @ffmpeg-installer/ffmpeg
RUN npm rebuild
EXPOSE 8000
CMD ["npm", "start"]

