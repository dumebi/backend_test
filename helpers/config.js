exports.config = {
  jwt: process.env.JWT_SECRET,
  blockchain: '',
  mongo: '',
  host: ''
}

if (process.env.NODE_ENV === 'development') {
  this.envConfig.blockchain = process.env.GANACHE
  this.envConfig.mongo = process.env.MONGO_DB_DEV_EXCHANGE
  this.envConfig.host = ''
  this.envConfig.db = ''
} else {
  this.envConfig.blockchain = process.env.GETH
  this.envConfig.mongo = process.env.MONGO_DB_PROD_EXCHANGE
  this.envConfig.host = ''
  this.envConfig.db = ''
}