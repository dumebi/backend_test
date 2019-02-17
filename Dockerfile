FROM node:10
WORKDIR '/app'
COPY ./package.json ./
RUN npm install
COPY . .

# EXPOSE 7000

CMD ["npm", "run", "start"]

# ENV JWT_SECRET="mysuperjwtsecret"
# ENV GANACHE="http://localhost:7545"
# ENV GETH="http://localhost:8545"
# ENV MONGO_LAB_PROD_EXCHANGE=""
# ENV MONGO_LAB_DEV_EXCHANGE="mongodb+srv://dikejude49:dyke2010@cluster0-m9uix.mongodb.net/STTP"
# ENV TARGET_SERVER_HOST=""
# ENV TARGET_SERVER_USER=""
# ENV NODE_ENV=development
# ENV ENCRYPTION_KEY="573rl1ng573rl1ng3ncry973ncry97ng"
# ENV PORT=3000