FROM node AS base

ENV JWT_SECRET="mysuperjwtsecret"
ENV GANACHE="http://10.0.12.71:8545"
ENV GETH=""
ENV MONGO_LAB_PROD_EXCHANGE="mongodb://sttp:WatmXGma0qBlH8VOsHKeKBY90SOvviMYAtqQcEpqTdHV5ZTEWSPt5U9Sp0MDIXIOIviDWH1ALbayYpWxD7zmYQ==@sttp.documents.azure.com:10255/?ssl=true"
ENV MONGO_LAB_DEV_EXCHANGE="mongodb://mongo/STTP"
ENV TARGET_SERVER_HOST=""
ENV TARGET_SERVER_USER=""
ENV NODE_ENV="development"
ENV ENCRYPTION_KEY="573rl1ng573rl1ng3ncry973ncry97ng"
ENV PORT=3000
ENV REDIS_URL=redis://redis
ENV AMQP_URL=amqp://rabbitMQ
ENV TEST_CONTRACT_ADDRESS=""
ENV CONTRACT_ADDRESS=""
ENV TEST_APP_NAIRA_ACCOUNT="0029614344"
ENV APP_NAIRA_ACCOUNT=""
ENV CONTRACT_OWNER_KEY="0xb76c47136bdf77363d8d9e0db53202df41d1a273e9de34f4d1f77aaa0124fd7d"

FROM base AS build
WORKDIR /src
COPY package.json .
RUN npm install
# RUN npm -g config set user root
# RUN npm i -g etherlime
#development  

FROM build AS publish
WORKDIR /app
COPY . .
COPY --from=build /src .
VOLUME ["/app","/app/node_modules"]
RUN node blockchain/deploy.js "SIT" "Sterling Investment Token" 1 "0x8d985f2977b8f5c450d7589b6d1c0f383b87f664" "0x44fae94ad304d60e4508ace436a1caf9836d077f"
# RUN touch contract.txt && node blockchain/deploy.js > contract.txt && cat contract.txt
# CMD [ "sh", "-c", "TEST_CONTRACT_ADDRESS=cat contract.txt nodemon index.js" ]
ENTRYPOINT ["npm", "run", "dev"]