FROM node:20

WORKDIR /app/lib
COPY --from=lib package*.json ./
RUN npm install

WORKDIR /app/service

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./
COPY --from=lib src ../lib/src
COPY src ./

CMD npm start
