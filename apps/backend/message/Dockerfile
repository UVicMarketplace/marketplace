FROM node:20

RUN apt-get update && apt-get install -y \
    libgtk2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xauth \
    xvfb

WORKDIR /app/lib
COPY --from=lib package*.json ./
RUN npm install

WORKDIR /app/service

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./
COPY cypress.config.ts ./
COPY --from=lib src ../lib/src
COPY cypress ./cypress
COPY src ./

CMD npm start
