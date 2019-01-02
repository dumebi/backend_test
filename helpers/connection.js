const mongoose = require('mongoose');
const utils = require('../helpers/utils');
require('dotenv').config();

module.exports =  {
    start : function () {

        mongoose.promise = global.promise;
        mongoose.connect(process.env.MONGO_LAB_DEV_EXCHANGE,
            {
                keepAlive: true,
                useNewUrlParser: true,
                useCreateIndex: true,
                useFindAndModify: false,
                reconnectTries: Number.MAX_VALUE,
                reconnectInterval: 500
            }
            )
            .then(() => {
            console.log('MongoDB is connected')
            })
            .catch((err) => {
            console.log(err)
            console.log('MongoDB connection unsuccessful, retry after 5 seconds.')
            setTimeout(connectWithRetry, 5000)
            })
    }
}



