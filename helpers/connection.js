require("dotenv").config();
const mongoose = require('mongoose');

module.exports =  {
    start : function () {

        mongoose.promise = global.promise;
        mongoose.connect(process.env.MONGO_LAB_DEV_EXCHANGE).then(() => {
            console.log("Connection to DB made successfully!")
        }).catch((e) => {
            console.log("An error occured while connecting to DB ; Error >> ", e)
        })
    }
}