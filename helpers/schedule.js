/**
 * Initialize Token Contract
 */
exports.initializeToken = async (req, res, next) => {
    try {
      const token = await checkToken(req);
      const user = await UserModel.findById(token.data.id).select('+privateKey')
      
      const privateKey = await secure.decrypt(user.privateKey)
      const sit = new Token('0x'+privateKey);
      
      req.SIT = sit
  
      return next()
  
    } catch (err) {
      console.log("err >> ", err)
      return res.status(HttpStatus.SERVER_ERROR).json({
        status: 'failed',
        data: 'Server error!.'
      })
    }
  }
  
  
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
    // console.log('First Thingy => ', scheduleId, amount, scheduleType, reason);
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