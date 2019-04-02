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

     return {
         SIT : sit
     }

   } catch (err) {
     console.log("err >> ", err)
     return res.status(HttpStatus.SERVER_ERROR).json({
       status: 'failed',
       data: 'Server error!.'
     })
   }
 }

exports.create_schedule_on_blockchain = (userId, scheduleId, amount, scheduleType, reason) => {
   console.log('First Thingy => ', userId, scheduleId, amount, scheduleType, reason);
   (async function (req, res, next) {
       "use strict";

       try {
           const result = await initializeToken(userId).SIT.createSchedule(scheduleId, amount, scheduleType, reason);
           console.log('Result => ', result);

       } catch (error) {
           console.log('Second Thingy => ', error);

       }
   }());
}