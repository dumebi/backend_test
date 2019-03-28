FROM node AS base

ENV JWT_SECRET="mysuperjwtsecret"
# ENV GANACHE="http://10.0.12.71:8545"
ENV GANACHE="http://192.168.22.83:8545"
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
ENV CONTRACT_OWNER_KEY="0xf2fca0e257c87df3f887a6203fb016cb0bcf08336891978af276bdcf496d21a3"

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
RUN node blockchain/deploy.js "SIT" "Sterling Investment Token" 1 "0xa8fef896d789d53fead1cfc1c95b6f36f9aacba3" "0x3d3ef3a735a628437079900f28c1eab717de1945"
# RUN touch contract.txt && node blockchain/deploy.js > contract.txt && cat contract.txt
# CMD [ "sh", "-c", "TEST_CONTRACT_ADDRESS=cat contract.txt nodemon index.js" ]
ENTRYPOINT ["npm", "run", "dev"]