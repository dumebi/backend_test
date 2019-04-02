const UserModel = require('../models/user');
const HttpStatus = require('./status')
const { Token } = require("../libraries/tokenContract");
const secure = require('../helpers/encryption.js');

  /**
   * Initialize Token Contract
   */
  const initializeToken = async (userId) => {
    try {
      const user = await UserModel.findById(userId).select('+privateKey')
      const privateKey = await secure.decrypt(user.privateKey)
      const sit = new Token('0x'+privateKey);
      return sit
  
    } catch (error) {
      console.log("err >> ", error)
      throw error
    }
  }

exports.create_schedule_on_blockchain = async (userId, scheduleId, amount, scheduleType, reason) => {
  try {
    const SIT = await initializeToken(userId)
      const result = await SIT.createSchedule(scheduleId, amount, scheduleType, reason);
      return result
      
  } catch (error) {
      console.log('Second Thingy => ', error);
      throw error
  }
}