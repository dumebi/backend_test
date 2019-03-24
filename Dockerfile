FROM node:10 AS base

ENV JWT_SECRET="mysuperjwtsecret"
ENV GANACHE="http://ganachecli"
ENV GETH="http://ganachecli"
ENV MONGO_LAB_PROD_EXCHANGE="mongodb://sttp:WatmXGma0qBlH8VOsHKeKBY90SOvviMYAtqQcEpqTdHV5ZTEWSPt5U9Sp0MDIXIOIviDWH1ALbayYpWxD7zmYQ==@sttp.documents.azure.com:10255/?ssl=true"
ENV MONGO_LAB_DEV_EXCHANGE="mongodb://mongo/STTP"
ENV TARGET_SERVER_HOST=""
ENV TARGET_SERVER_USER=""
ENV NODE_ENV="development"
ENV ENCRYPTION_KEY="573rl1ng573rl1ng3ncry973ncry97ng"
ENV PORT=3000
ENV REDIS_URL=redis://redis
ENV AMQP_URL=amqp://rabbitMQ

FROM base AS build
WORKDIR /src
COPY package.json .
RUN npm install
# RUN npm i -g etherlime
#development  

FROM build AS publish
WORKDIR /app
COPY . .
COPY --from=build /src .
VOLUME ["/app","/app/node_modules"]
ENTRYPOINT ["npm", "run", "dev"]
