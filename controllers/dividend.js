const DividendModel = require('../models/dividend');
const DividendGroupModel = require('../models/dividendGroup');
const UserModel = require('../models/user');
const UserController = require('../controllers/user');
const HttpStatus = require('../helpers/status');
const {
  paramsNotValid, generateTransactionReference, checkToken
} = require('../helpers/utils');


const DividendController = {
  /**
    * Get Dividends
    * @description Get all dividends
    * @param {string} group   User group
    * @param {string} to      to date
    * @param {string} from    from date
    * @param {string} status  Dividend status
    * @return {object[]} dividends
    */
  async all(req, res, next) {
    try {
      let { page, count } = req.query
      const {
        group, to, from, status
      } = req.query

      page = parseInt(page, 10)
      count = parseInt(count, 10)

      page = req.query.page == null || page <= 0 ? 1 : page
      count = req.query.count == null || count <= 0 ? 50 : count

      const query = { }
      if (status) query.status = DividendModel.Status[status.toUpperCase()]
      if (group) query.group = UserModel.UserGroup[group.toUpperCase()]

      if (from && to == null) query.createdAt = { $gte: from }
      if (to && from == null) query.createdAt = { $lt: to }
      if (from && to) query.createdAt = { $lt: to, $gte: from }

      // const dividends = await DividendModel.find(query).sort({ createdAt: -1 })
      // return res.status(HttpStatus.OK).json({ status: 'success', message: 'dividends retrieved', data: dividends });
      const [dividends, dividendCount] = await Promise.all([DividendModel.find(query).sort({ createdAt: -1 }).skip((page - 1) * count).limit(count), DividendModel.count(query)]);
      const allDividendsPromise = dividends.map(dividend => DividendGroupModel.find({ dividend: dividend._id }))
      const DividendGroups = await Promise.all(allDividendsPromise);
      const new_dividends = UserController.deepCopy(dividends)
      for (let index = 0; index < dividends.length; index++) {
        // const dividend = ;
        const DividendGroup = DividendGroups[index]
        console.log('dividend items')
        console.log(DividendGroup)
        new_dividends[index].groups = DividendGroup
      }
      console.log(dividends.length)
      if (new_dividends) {
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'User dividends retrieved',
          data: new_dividends,
          count: dividendCount
        });
      }
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'dividends retrieved', data: [] });
    } catch (error) {
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not get dividends',
        devError: error
      }
      next(err)
    }
  },

  /**
    * Get Dividend
    * @description Get dividend
    * @param {string} group   User group
    * @param {string} to      to date
    * @param {string} from    from date
    * @param {string} status  Dividend status
    * @return {object[]} dividends
    */
  async one(req, res, next) {
    try {
      if (paramsNotValid(req.params.dividend_id)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const token = await checkToken(req);
      if (token.status === 'failed') {
        return res.status(token.data).json({
          status: 'failed',
          message: token.message
        })
      }

      console.log(req.params.dividend_id)
      const dividend = await DividendModel.findById(req.params.dividend_id)
      if (dividend) {
        return res.status(HttpStatus.OK).json({ status: 'success', message: 'Dividend disabled successfully', data: dividend });
      }
      return res.status(HttpStatus.NOT_FOUND).json({ status: 'failed', message: 'Dividend not found' });
    } catch (error) {
      console.log(error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not get dividend',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Create Dividend
   * @description Creates a user dividend
   * @param {string} group  User group
   * @param {string} name   Dividend name
   * @param {string} amount Dividend amount
   * @param {string} date   Payment date
   * @return {object} dividend
   */
  async create(req, res, next) {
    try {
      if (paramsNotValid(req.body.name, req.body.group, req.body.date)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const token = await checkToken(req);
      if (token.status === 'failed') {
        return res.status(token.data).json({
          status: 'failed',
          message: token.message
        })
      }
      const _dividend = new DividendModel({
        dividendId: generateTransactionReference(),
        name: req.body.name,
        date: new Date(req.body.date),
        enabled: false,
        createdby: token.data.id
      })

      const dividend = await _dividend.save()
      const groups = req.body.group;
      const createDividendGropusPromise = groups.map( group => DividendGroupModel.create({ dividend: dividend._id, level: group.level, amount: group.amount }) )
      const DividendGroups = await Promise.all(createDividendGropusPromise);

      const new_dividend = UserController.deepCopy(dividend)
      new_dividend.group = DividendGroups
      // TODO: create blockchain dividend

      return res.status(HttpStatus.OK).json({ status: 'success', message: 'Schedule created successfully', data: new_dividend });

      // return res.status(HttpStatus.OK).json({ status: 'success', message: 'Dividend created successfully', data: dividend });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not create dividend',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Enable Dividend
   * @description Enable a dividend
   * @param {string} dividend_id Dividend ID
   * @return {object} user
   */
  async enable(req, res, next) {
    try {
      if (paramsNotValid(req.params.dividend_id)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const token = await checkToken(req);
      if (token.status === 'failed') {
        return res.status(token.data).json({
          status: 'failed',
          message: token.message
        })
      }

      const dividend = await DividendModel.findByIdAndUpdate(
        req.params.dividend_id,
        { enabled: true, authorizedby: token.data.id },
        { safe: true, multi: true, new: true }
      )
      if (dividend) {
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'Dividend enabled successfully',
          data: dividend
        })
      }
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: 'Dividend not found',
      })
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not enable dividend',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Disable Dividend
   * @description Disable a dividend
   * @param {string} dividend_id Dividend ID
   * @return {object} user
   */
  async disable(req, res, next) {
    try {
      if (paramsNotValid(req.params.dividend_id)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const token = await checkToken(req);
      if (token.status === 'failed') {
        return res.status(token.data).json({
          status: 'failed',
          message: token.message
        })
      }

      const dividend = await DividendModel.findByIdAndUpdate(
        req.params.dividend_id,
        { enabled: false, disabledby: token.data.id },
        { safe: true, multi: true, new: true }
      )
      if (dividend) {
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'Dividend disabled successfully',
          data: dividend
        })
      }
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: 'Dividend not found',
      })
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not disable dividend',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Update Dividend
     * @description Update a dividend
     * @param {string} group        User group
     * @param {string} name         Dividend name
     * @param {string} amount       Dividend amount
     * @param {string} date         Dividend date
     * @param {string} status       Dividend status
     * @param {string} dividend_id  Dividend ID
     * @return {object} dividend
     */
  async update(req, res, next) {
    try {
      if (paramsNotValid(req.params.dividend_id)) {
        return res.status(HttpStatus.PRECONDITION_FAILED).json({
          status: 'failed',
          message: 'some parameters were not supplied'
        })
      }
      const token = await checkToken(req);
      if (token.status === 'failed') {
        return res.status(token.data).json({
          status: 'failed',
          message: token.message
        })
      }
      delete req.body.dividendId
      delete req.body.enabled
      delete req.body.createdby
      delete req.body.authorizedby
      delete req.body.disabledby
      const dividend = await DividendModel.findByIdAndUpdate(
        req.params.dividend_id,
        { $set: req.body },
        { safe: true, multi: true, new: true }
      )
      if (dividend) {
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'Dividend has been updated',
          data: dividend
        })
      }
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: 'Dividend not found',
      })
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error updating dividend',
        devError: error
      }
      next(err)
    }
  },
};

module.exports = DividendController;
