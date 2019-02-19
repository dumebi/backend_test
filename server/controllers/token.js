const TokenModel = require('../models/token');
// const { sendUserToken, sendUserSignupEmail } = require('../helpers/emails');
const {
  paramsNotValid, sendMail, createToken, config, checkToken
} = require('../helpers/utils');
const HttpStatus = require('../helpers/status');

const TokenController = {
  /**
   * ORDER BOOK - BID ORDERS
   * @description Get Buy Order book for token
   * @param {string} id Token ID
   * @return {object} user
   */
  async buyOrderBook(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }

      const arrPricesBuy = []
      const arrVolumesBuy = []
      const token = await TokenModel.findById(req.params.id);

      let whilePrice = token.lowestBuyPrice;
      let counter = 0

      const buyBook = JSON.parse(token.buyBook)

      if (token.curBuyPrice > 0) {
        while (whilePrice <= token.curBuyPrice) {
          arrPricesBuy[counter] = whilePrice;
          let volumeAtPrice = 0;
          let offers_key = 0;

          offers_key = buyBook[whilePrice].offers_key;
          while (offers_key <= buyBook[whilePrice].offers_length) {
            volumeAtPrice += buyBook[whilePrice].offers[offers_key].amount;
            offers_key++;
          }

          arrVolumesBuy[counter] = volumeAtPrice;

          // next whilePrice
          if (whilePrice === buyBook[whilePrice].higherPrice) {
            break;
          } else {
            whilePrice = buyBook[whilePrice].higherPrice;
          }
          counter++;
        }
        token.buyBook = JSON.stringify(buyBook)
        await token.save()
      }
      return { arrPricesBuy, arrVolumesBuy };
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not get buy order book',
        devError: error
      }
      next(err)
    }
  },

  /**
   * ORDER BOOK - ASK ORDERS
   * @description Get Sell Order book for token
   * @param {string} id Token ID
   * @return {object} user
   */
  async sellOrderBook(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }

      const arrPricesSell = []
      const arrVolumesSell = []
      const token = await TokenModel.findById(req.params.id);

      let whilePrice = token.curSellPrice;
      let counter = 0

      const sellBook = JSON.parse(token.sellBook)

      if (token.curSellPrice > 0) {
        while (whilePrice <= token.highestSellPrice) {
          arrPricesSell[counter] = whilePrice;
          let volumeAtPrice = 0;
          let offers_key = 0;

          offers_key = sellBook[whilePrice].offers_key;
          while (offers_key <= sellBook[whilePrice].offers_length) {
            volumeAtPrice += sellBook[whilePrice].offers[offers_key].amount;
            offers_key++;
          }

          arrVolumesSell[counter] = volumeAtPrice;

          // next whilePrice
          if (sellBook[whilePrice].higherPrice === 0) {
            break;
          } else {
            whilePrice = sellBook[whilePrice].higherPrice;
          }
          counter++;
        }
        token.sellBook = JSON.stringify(sellBook)
        await token.save()
      }
      return { arrPricesSell, arrVolumesSell };
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not get buy order book',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Add a buy offer
   * @description Create a buy offer
   * @param {object} token  MongoDB token object
   * @param {int} price     Offer price
   * @param {int} amount    Offer price
   * @param {object} user   User object
   */
  async addBuyOffer(token, price, amount, user) {
    const buyBook = JSON.parse(token.buyBook)
    buyBook[price].offers_length++
    buyBook[price].offers[buyBook[price].offers_length] = { amount, user: user._id }

    if (buyBook[price].offers_length === 1) {
      buyBook[price].offers_length.offers_key = 1;
      // we have a new buy order - increase the counter, so we can set the getOrderBook array later
      token.amountBuyPrices++
      const curBuyPrice = token.curBuyPrice;
      const lowestBuyPrice = token.lowestBuyPrice;
      if (lowestBuyPrice === 0 || lowestBuyPrice > price) {
        if (curBuyPrice === 0) {
          // there is no buy order yet, we insert the first one...
          token.curBuyPrice = price;
          token.buyBook[price].higherPrice = price;
          token.buyBook[price].lowerPrice = 0;
        } else {
          // or the lowest one
          token.buyBook[lowestBuyPrice].lowerPrice = price;
          token.buyBook[price].higherPrice = lowestBuyPrice;
          token.buyBook[price].lowerPrice = 0;
        }
        token.lowestBuyPrice = price;
      } else if (curBuyPrice < price) {
        // the offer to buy is the highest one, we don't need to find the right spot
        token.buyBook[curBuyPrice].higherPrice = price;
        token.buyBook[price].higherPrice = price;
        token.buyBook[price].lowerPrice = curBuyPrice;
        token.curBuyPrice = price;
      } else {
        // we are somewhere in the middle, we need to find the right spot first...

        let buyPrice = token.curBuyPrice;
        let weFoundIt = false;

        while (buyPrice > 0 && !weFoundIt) {
          if (buyPrice < price && token.buyBook[buyPrice].higherPrice > price) {
            // set the new order-book entry higher/lowerPrice first right
            token.buyBook[price].lowerPrice = buyPrice;
            token.buyBook[price].higherPrice = token.buyBook[buyPrice].higherPrice;

            // set the higherPrice'd order-book entries lowerPrice to the current Price
            token.buyBook[token.buyBook[buyPrice].higherPrice].lowerPrice = price;
            // set the lowerPrice'd order-book entries higherPrice to the current Price
            token.buyBook[buyPrice].higherPrice = price;

            // set we found it.
            weFoundIt = true;
          }
          buyPrice = token.buyBook[buyPrice].lowerPrice;
        }
      }
    }
    await token.save()
  }

};

module.exports = TokenController;
