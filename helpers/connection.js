const mongoose = require("mongoose");
const utils = require("../helpers/utils");

module.exports = {
  start() {
    mongoose.promise = global.promise;
    mongoose
      .connect(utils.config.mongo, {
        keepAlive: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 500
      })
      .then(() => {
        console.log("MongoDB is connected");
      })
      .catch(err => {
        console.log(err);
        console.log("MongoDB connection unsuccessful, retry after 5 seconds.");
        setTimeout(this.start, 5000);
      });
  }
};
