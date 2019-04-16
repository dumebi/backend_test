const cron = require('node-cron');
const TokenModel = require('../models/token');
const OHLVCModel = require('../models/ohlvc');

cron.schedule('00 00 00 * * *', async () => {
  try {
    const [token, prev_] = await Promise.all([TokenModel.findOne({ name: 'STTP' }), OHLVCModel.findOne().sort('-created_at')])
    if (prev_){
      prev_.close = token.price

      ohlvc = new OHLVCModel({
        high: token.high,
        open: token.price,
        low: token.low,
        vol: token.vol,
      })

      await Promise.all([prev_.save(), ohlvc.save()])
    } else {
      ohlvc = new OHLVCModel({
        high: token.high,
        open: token.price,
        low: token.low,
        vol: token.vol,
      })
      await ohlvc.save()
    }
  } catch (error) {
    console.log('cron failed')
    console.log(error);
  }
});
