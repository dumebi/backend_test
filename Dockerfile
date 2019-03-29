FROM node AS base

ENV JWT_SECRET="mysuperjwtsecret"
# ENV GANACHE="http://10.0.12.71:8545"
ENV GANACHE="http://192.168.8.100:8545"
ENV GETH=""
ENV MONGO_LAB_PROD_EXCHANGE="mongodb://sttp:WatmXGma0qBlH8VOsHKeKBY90SOvviMYAtqQcEpqTdHV5ZTEWSPt5U9Sp0MDIXIOIviDWH1ALbayYpWxD7zmYQ==@sttp.documents.azure.com:10255/?ssl=true"
ENV MONGO_LAB_DEV_EXCHANGE="mongodb://mongo/STTP"
# ENV MONGO_LAB_DEV_EXCHANGE="mongodb://localhost:27017/STTP"
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
ENV CONTRACT_OWNER_KEY="0xb2ac9122bafc15cec45e364f13118963628857462045d74f2e45c0e3aa21f6d8"

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
RUN node blockchain/deploy.js "SIT" "Sterling Investment Token" 1 "0x1ae2ec290b416fa2bfcd36af39b818d40ba28d9b" "0x95a9bf7fba78651cb82db0f188c24650ccdbc341"
# RUN touch contract.txt && node blockchain/deploy.js > contract.txt && cat contract.txt
# CMD [ "sh", "-c", "TEST_CONTRACT_ADDRESS=cat contract.txt nodemon index.js" ]
ENTRYPOINT ["npm", "run", "dev"]