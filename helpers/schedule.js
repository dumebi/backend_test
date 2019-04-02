
const UserModel = require('../models/user');
const HttpStatus = require('./status')
const { Token } = require("../libraries/tokenContract");
const secure = require('../helpers/encryption.js');

  /**
   * Initialize Token Contract
   */
  const initializeToken = async (userId) => {
    try {
      console.log("userId >> ", userId)
      const user = await UserModel.findById(userId).select('+privateKey')
      console.log("user >> ",user)
      const privateKey = await secure.decrypt(user.privateKey)
      const sit = new Token('0x'+privateKey);
      console.log("sit >> ", sit)
      return sit
  
    } catch (err) {
      console.log("err >> ", err)
      throw err
    }
  }

exports.create_schedule_on_blockchain = async (userId, scheduleId, amount, scheduleType, reason) => {
    // (async function () {
    //     "use strict";
        try {
          console.log("userId2 >> ", userId)
          const SIT = await initializeToken(userId)
            const result = await SIT.createSchedule(scheduleId, amount, scheduleType, reason);
            console.log('Result => ', result);

        } catch (error) {
            console.log('Second Thingy => ', error);
        }
    // }());
}