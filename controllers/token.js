const TokenModel = require('../models/token');
// const BookModel = require('../models/book');
const OfferModel = require('../models/offer');
const UserModel = require('../models/user');
// const WalletModel = require('../models/wallet');
const TransactionModel = require('../models/transaction');
// const { sendUserToken, sendUserSignupEmail } = require('../helpers/emails');
const {
  paramsNotValid, sendMail, createToken, config, checkToken
} = require('../helpers/utils');
const HttpStatus = require('../helpers/status');


const TokenController = {
  /**
   * Initialize token
   * @description initialize the STTP token
   * @return {object} token
   */
  async init(req, res, next) {
    try {
      const token = await TokenModel.findOne({ name: 'STTP' });
      if (token) {
        return res.status(HttpStatus.OK).json({ status: 'success', message: 'Token already created', data: token });
      }
      let newToken = new TokenModel({
        name: 'STTP'
      })
      newToken = await newToken.save();
      console.log('hard worker')
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'Token created successfully', data: newToken });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not initialize token',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Market Buy
   * @description Buy a token at market price
   * @param {object} token  MongoDB token object
   * @param {int} price     Offer price
   * @param {int} amount    Offer price
   * @param {object} buyer  Buyer object
   */
  async marketBuy(token, buyer, amount) {
    let result;
    const sellOffers = await OfferModel.find({
      token: token._id, type: 'Sell', sold: false, user: { $ne: buyer }
    }).sort('price');
    if (sellOffers.length > 0) {
      const lowestSellOffer = sellOffers[0];
      if (lowestSellOffer.amount < amount) {
        // DONE: Process that transaction, call market buy with remaining amount
        result = await TokenController.processSale(token, lowestSellOffer.amount, buyer, lowestSellOffer.user, lowestSellOffer.price, lowestSellOffer)

        const newamount = amount - lowestSellOffer.amount
        // DONE: call market buy for the new amount
        result = await TokenController.marketBuy(token, buyer, newamount)
      } else if (lowestSellOffer.amount === amount) {
        // DONE: Process that transaction
        result = await TokenController.processSale(token, amount, buyer, lowestSellOffer.user, lowestSellOffer.price, lowestSellOffer)
      } else {
        // DONE: Process that transaction
        result = await TokenController.processSale(token, amount, buyer, lowestSellOffer.user, lowestSellOffer.price, lowestSellOffer)

        // DONE: post a limit sell order for the seller
        if (result.status === 'success') {
          const newamount = lowestSellOffer.amount - amount
          // DONE: post a limit sell order for the seller
          result = await TokenController.limitSell(token, lowestSellOffer.price, lowestSellOffer.user, newamount)
        }
      }
    } else {
      // DONE: post buy limit order
      const tokenPrice = await TokenModel.findOne({ name: 'STTP' });
      result = await TokenController.limitBuy(token, tokenPrice.price, buyer, amount)
    }
    return result
  },

  /**
   * Market Buy
   * @description Buy a token at market price
   * @param {object} token  MongoDB token object
   * @param {int} price     Offer price
   * @param {int} amount    Offer price
   * @param {object} seller Seller object
   */
  async marketSell(token, seller, amount) {
    let result;
    const buyOffers = await OfferModel.find({
      token: token._id, type: 'Buy', sold: false, user: { $ne: seller }
    }).sort('-price');
    if (buyOffers.length > 0) {
      const highestBuyOffer = buyOffers[0];
      if (highestBuyOffer.amount < amount) {
        // DONE: Process that transaction, call market sell with remaining amount
        result = await TokenController.processSale(token, highestBuyOffer.amount, highestBuyOffer.user, seller, highestBuyOffer.price, highestBuyOffer)

        if (result.status === 'success') {
          const newamount = amount - highestBuyOffer.amount
          // DONE: call market buy for the new amount
          result = await TokenController.marketSell(token, seller, newamount)
        }
      } else if (highestBuyOffer.amount === amount) {
        // DONE: Process that transaction
        result = await TokenController.processSale(token, amount, highestBuyOffer.user, seller, highestBuyOffer.price, highestBuyOffer)
      } else {
        // DONE: Process that transaction
        result = await TokenController.processSale(token, amount, highestBuyOffer.user, seller, highestBuyOffer.price, highestBuyOffer)

        // DONE: post a limit sell order for the seller
        if (result.status === 'success') {
          const newamount = highestBuyOffer.amount - amount
          // DONE: post a limit sell order for the seller
          result = await TokenController.limitBuy(token, token.price, highestBuyOffer.user, newamount)
        }
      }
    } else {
      // DONE: post sell limit order
      const tokenPrice = await TokenModel.findOne({ name: 'STTP' });
      console.log(tokenPrice)
      result = await TokenController.limitSell(token, tokenPrice.price, seller, amount)
    }
    return result
  },

  /**
   * Limit Sell
   * @description Sell a token at market price
   * @param {object} token  MongoDB token object
   * @param {int} price     Offer price
   * @param {int} amount    Amount of tokens
   * @param {object} seller Offer Seller
   */
  async limitSell(token, price, seller, amount) {
    console.log(price, amount)
    let result;
    // const token = await TokenModel.findById({ name: 'STTP' });
    const buyOffers = await OfferModel.find({
      token: token._id,
      type: 'Buy',
      sold: false,
      price,
      user: { $ne: seller }
    }).sort('amount');
    if (buyOffers.length > 0) {
      const lowestBuyOffer = buyOffers[0];
      if (lowestBuyOffer.amount < amount) {
        // DONE: Process that transaction, call limit sell with remaining amount
        result = await TokenController.processSale(token, lowestBuyOffer.amount, lowestBuyOffer.user, seller, lowestBuyOffer.price, lowestBuyOffer)

        if (result.status === 'success') {
          const newamount = amount - lowestBuyOffer.amount
          // DONE: call limit sell for the new amount
          result = await TokenController.limitSell(token, price, seller, newamount)
        }
      } else if (lowestBuyOffer.amount === amount) {
        // DONE: Process that transaction
        result = await TokenController.processSale(token, amount, lowestBuyOffer.user, seller, lowestBuyOffer.price, lowestBuyOffer)
      } else {
        // DONE: Process that transaction
        result = await TokenController.processSale(token, amount, lowestBuyOffer.user, seller, lowestBuyOffer.price, lowestBuyOffer)

        if (result.status === 'success') {
          const newamount = lowestBuyOffer.amount - amount
          // DONE: post a limit sell order for the seller
          result = await TokenController.limitBuy(token, price, lowestBuyOffer.user, newamount)
        }
      }
    } else {
      // TODO: Deduct tokens from user

      // DONE: Add sell offer
      const offer = new OfferModel({
        type: 'Sell',
        amount,
        price,
        user: seller,
        token,
      })
      await Promise.all([offer.save()])
      result = {
        http: HttpStatus.OK,
        status: 'success',
        message: 'Buy process completed successfully'
      }
    }
    return result
  },

  /**
   * Limit Buy
   * @description Buy a token at market price
   * @param {object} token  MongoDB token object
   * @param {int} price     Offer price
   * @param {int} amount    Amount of tokens
   * @param {object} seller Offer Buyer
   */
  async limitBuy(token, price, buyer, amount) {
    let result;
    const sellOffers = await OfferModel.find({
      token, type: 'Sell', sold: false, price, user: { $ne: buyer }
    }).sort('amount');
    console.log(sellOffers.length)
    if (sellOffers.length > 0) {
      const lowestSellOffer = sellOffers[0];
      if (lowestSellOffer.amount < amount) {
        // DONE: Process that transaction, call limit sell with remaining amount
        result = await TokenController.processSale(token, lowestSellOffer.amount, buyer, lowestSellOffer.user, lowestSellOffer.price, lowestSellOffer)

        if (result.status === 'success') {
          const newamount = amount - lowestSellOffer.amount
          // DONE: call limit buy for the new amount
          result = await TokenController.limitBuy(token, price, buyer, newamount)
        }
      } else if (lowestSellOffer.amount === amount) {
        // DONE: Process that transaction
        result = await TokenController.processSale(token, amount, buyer, lowestSellOffer.user, lowestSellOffer.price, lowestSellOffer)
      } else {
        // DONE: Process that transaction
        result = await TokenController.processSale(token, amount, buyer, lowestSellOffer.user, lowestSellOffer.price, lowestSellOffer)

        if (result.status === 'success') {
          const newamount = lowestSellOffer.amount - amount
          // DONE: post a limit sell order for the seller
          result = await TokenController.limitSell(token, price, lowestSellOffer.user, newamount)
        }
      }
    } else {
      // DONE: check buyer has enough cash
      buyer = await UserModel.findById(buyer).populate('wallet');
      const total_funds_required = parseInt(amount * price, 10)
      if (buyer.wallet.balance < total_funds_required) {
        result = {
          http: HttpStatus.BAD_REQUEST,
          status: 'failed',
          message: 'Not enough funds'
        }
      } else {
        // DONE: Deduct cash from user
        buyer.wallet.balance -= total_funds_required

        // DONE: Add buy offer
        const offer = new OfferModel({
          type: 'Buy',
          amount,
          price,
          user: buyer,
          token,
        })
        await Promise.all([offer.save(), buyer.wallet.save()])
        result = {
          http: HttpStatus.OK,
          status: 'success',
          message: 'Buy process completed successfully'
        }
      }
    }
    return result
  },

  /**
   * Process Sale
   * @description function to process sale of token
   * @param {object} token  MongoDB token object
   * @param {int} amount    Amount of tokens
   * @param {object} seller Offer Seller
   * @param {object} buyer  Offer Buyer
   * @param {int} price     Offer price
   * @param {int} offer     Offer Object
   */
  async processSale(token, amount, buyer, seller, price, offer) {
    try {
      // TODO: check seller has enough tokens
      seller = await UserModel.findById(seller).populate('wallet');
      const enoughTokens = true;
      // DONE: check buyer has enough cash
      buyer = await UserModel.findById(buyer).populate('wallet');
      const total_funds_required = parseInt(amount * price, 10)
      if (!enoughTokens) {
        return {
          http: HttpStatus.BAD_REQUEST,
          status: 'failed',
          message: 'Not enough tokens'
        }
      }
      if (buyer.wallet.balance < total_funds_required) {
        return {
          http: HttpStatus.BAD_REQUEST,
          status: 'failed',
          message: 'Not enough funds'
        }
      }

      // DONE: Transfer cash from buyer to seller
      console.log(buyer.wallet.balance, total_funds_required, amount, price)
      buyer.wallet.balance -= total_funds_required

      seller.wallet.balance += total_funds_required

      // DONE: log cash transfer transaction
      const buyTransaction = new TransactionModel({
        user: buyer._id,
        type: TransactionModel.Type.BUY,
        wallet: TransactionModel.Wallet.NAIRA,
        volume: amount,
        amount: price,
        status: TransactionModel.Status.COMPLETED,
      })
      // transaction.save()

      // TODO: Transfer tokens from seller to buyer
      const transfer = '';
      // DONE: log token transfer transaction
      const sellTransaction = new TransactionModel({
        user: seller._id,
        type: TransactionModel.Type.Sell,
        from: seller.address, // sender
        to: buyer.address, // receiver
        wallet: TransactionModel.Wallet.SIT,
        volume: amount,
        amount: price,
        txHash: transfer.txHash,
        status: TransactionModel.Status.COMPLETED,
      })

      // DONE: set token current price as the new buy price

      await Promise.all([TokenModel.findOneAndUpdate({ _id: token }, { price }), buyer.wallet.save(), seller.wallet.save(), buyTransaction.save(), sellTransaction.save(), OfferModel.findOneAndUpdate({ _id: offer._id }, { sold: true })])
      return {
        http: HttpStatus.OK,
        status: 'success',
        message: 'Buy process completed successfully'
      }
    } catch (error) {
      console.log('error >> ', error)
      return {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not get buy order book',
        devError: error
      }
    }
  },

  /**
   * ORDER BOOK - BID ORDERS
   * @description Get Buy Order book for token
   * @return {object} buy book
   */
  async buyOrderBook(req, res, next) {
    try {
      const token = await TokenModel.findOne({ name: 'STTP' });
      if (!token) {
        return res.status(HttpStatus.NOT_FOUND).json({ status: 'failed', message: 'Token not found' });
      }
      const buyOffers = await OfferModel.find({ token: token._id, type: 'Buy', sold: false }, { type: 0, token: 0, sold: 0 }).sort('price');
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'Buy order book gotten successfully', data: buyOffers });
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
   * @description Get Buy Order book for token
   * @return {object} buy book
   */
  async sellOrderBook(req, res, next) {
    try {
      const token = await TokenModel.findOne({ name: 'STTP' });
      if (!token) {
        return res.status(HttpStatus.NOT_FOUND).json({ status: 'failed', message: 'Token not found' });
      }
      const sellOffers = await OfferModel.find({ token: token._id, type: 'Sell', sold: false }, { type: 0, token: 0, sold: 0 }).sort('price');
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'Sell order book gotten successfully', data: sellOffers });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not get sell order book',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Buy Token
   * @description Buy a token
   * @param {string} id Token ID
   */
  async buy(req, res, next) {
    try {
      if (paramsNotValid(req.body.amount)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const usertoken = await checkToken(req);
      if (usertoken.status === 'failed') {
        return res.status(usertoken.data).json({
          status: 'failed',
          message: usertoken.message
        })
      }
      const user = await UserModel.findById(usertoken.data.id)
      const token = await TokenModel.findOne({ name: 'STTP' });

      const price = req.body.price;
      const amount = req.body.amount;

      let result;

      if (price) {
        result = await TokenController.limitBuy(token._id, price, user._id, amount)
      } else {
        result = await TokenController.marketBuy(token._id, user._id, amount)
      }

      if (result.status === 'success') {
        return res.status(HttpStatus.OK).json({ status: 'success', message: 'Buy order processed successfully' });
      }
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'failed', message: result.message });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'could not process buy order',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Sell Token
   * @description Sell a token
   * @param {string} id Token ID
   */
  async sell(req, res, next) {
    try {
      if (paramsNotValid(req.body.amount)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const usertoken = await checkToken(req);
      if (usertoken.status === 'failed') {
        return res.status(usertoken.data).json({
          status: 'failed',
          message: usertoken.message
        })
      }
      const user = await UserModel.findById(usertoken.data.id)
      const token = await TokenModel.findOne({ name: 'STTP' });

      const price = req.body.price;
      const amount = req.body.amount;

      let result;

      if (price) {
        result = await TokenController.limitSell(token._id, price, user._id, amount)
      } else {
        result = await TokenController.marketSell(token._id, user._id, amount)
      }

      if (result.status === 'success') {
        return res.status(HttpStatus.OK).json({ status: 'success', message: 'Sell order processed successfully' });
      }
      return res.status(HttpStatus.BAD_REQUEST).json({ status: 'failed', message: result.message });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'could not process sell order',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Cancel Offer
   * @description Cancel a buy or sell offer
   * @param {string} id Offer ID
   */
  async cancel(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const usertoken = await checkToken(req);
      if (usertoken.status === 'failed') {
        return res.status(usertoken.data).json({
          status: 'failed',
          message: usertoken.message
        })
      }
      const user = await UserModel.findById(usertoken.data.id).populate('wallet');
      const offer = await OfferModel.findById(req.params.id);

      if (!offer) {
        return res.status(HttpStatus.BAD_REQUEST).json({ status: 'failed', message: 'offer not found' });
      }

      if (offer.sold === true) {
        return res.status(HttpStatus.BAD_REQUEST).json({ status: 'failed', message: 'offer has been fulfilled' });
      }

      if (offer.type === 'Buy') {
        const total_funds = offer.amount * offer.price

        // DONE: Credit user back the funds
        user.wallet.balance += total_funds;
        await user.wallet.save()

        // DONE: Delete the offer
        await OfferModel.findByIdAndRemove(offer._id);
      } else if (offer.type === 'Sell') {
        const total_funds = offer.amount * offer.price

        // TODO: Credit user back the tokens


        // DONE: Delete the offer
        // await OfferModel.findByIdAndRemove(offer._id);
      }

      return res.status(HttpStatus.OK).json({ status: 'success', message: 'Order has been removed successfully' });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'could not process sell order',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Set Price
   * @description set the price of a token, in naira
   * @param {string} price token price
   */
  async setPrice(req, res, next) {
    try {
      if (paramsNotValid(req.body.price)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const usertoken = await checkToken(req);
      if (usertoken.status === 'failed') {
        return res.status(usertoken.data).json({
          status: 'failed',
          message: usertoken.message
        })
      }
      const PriceTransaction = new TransactionModel({
        user: usertoken.data.id,
        type: TransactionModel.Type.PRICE,
        from: usertoken.data.id, // sender
        wallet: TransactionModel.Wallet.NAIRA,
        amount: req.body.price,
        status: TransactionModel.Status.COMPLETED,
      })

      await Promise.all([TokenModel.findOneAndUpdate({ name: 'STTP' }, { price: req.body.price }), PriceTransaction.save()])
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'Token price has been set successfully' });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'could not set token price',
        devError: error
      }
      next(err)
    }
  }
};

module.exports = TokenController;
