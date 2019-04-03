const UserModel = require('../models/user');
const HttpStatus = require('./status')
const { Token } = require("../libraries/tokenContract");
const secure = require('../helpers/encryption.js');
const {_initializeToken} = require('../helpers/middleware.js');

exports.create_schedule_on_blockchain = async (userId, scheduleId, amount, scheduleType, reason) => {
  try {
    const SIT = await _initializeToken(userId)
      const result = await SIT.createSchedule(scheduleId, amount, scheduleType, reason);
      return result

  } catch (error) {
      console.log('Second Thingy => ', error);
      throw error
  }
}

exports.fetch_single_schedule_on_blockchain = async (userId, scheduleId) => {
  try {
      const SIT = await _initializeToken(userId)
      const result = await SIT.getSchedule(ethers.utils.formatBytes32String(scheduleId));
      return result
      
  } catch (error) {
      console.log('Second Thingy => ', error);
      throw error
  }
}

exports.delete_schedule_on_blockchain = async (userId, scheduleId) => {
  try {
      const SIT = await _initializeToken(userId)
      const result = await SIT.removeSchedule(ethers.utils.formatBytes32String(scheduleId));
      console.log(ethers.utils.formatBytes32String(scheduleId));
      
      return result
      
  } catch (error) {
      console.log('Second Thingy => ', error);
      throw error
  }
}