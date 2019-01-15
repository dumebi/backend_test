const DividendModel = require('../models/dividend');
const UserModel = require('../models/user');
const HttpStatus = require('../helpers/status');
const {
  paramsNotValid, generateTransactionReference, checkToken
} = require('../helpers/utils');


const DividendController = {
  /**
    * Get all dividends
    * @param {string} group
    * @param {string} to
    * @param {string} from
    * @param {string} status
    * @return {object[]} dividends
    */
  async all(req, res, next) {
    try {
      const {
        group, to, from, status
      } = req.query

      const query = { }
      if (status) query.status = DividendModel.Status[status.toUpperCase()]
      if (group) query.group = UserModel.UserGroup[group.toUpperCase()]

      if (from && to == null) query.createdAt = { $gte: from }
      if (to && from == null) query.createdAt = { $lt: to }
      if (from && to) query.createdAt = { $lt: to, $gte: from }

      const dividends = await DividendModel.find(query).sort({ createdAt: -1 })
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'dividends retrieved', data: dividends });
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
   * Create a dividend
   * @param {string} group
   * @param {string} amount
   * @param {string} date
   * @param {string} status
   *
   * @return {object} dividend
   */
  async create(req, res, next) {
    try {
      if (paramsNotValid(req.body.group, req.body.amount, req.body.date, req.body.status)) {
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
      const dividend = new DividendModel({
        dividendId: generateTransactionReference(),
        group: req.body.group,
        amount: req.body.amount,
        date: req.body.date,
        enabled: false,
        createdby: token.data.id
      })

      await dividend.save()

      return res.status(HttpStatus.OK).json({ status: 'success', message: 'Schedule created successfully', data: dividend });
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
   * Enable a dividend
   * @param {string} email
   * @param {string} password
   *
   * @return {object} user
   */
  async enable(req, res, next) {
    try {
      if (paramsNotValid(req.body.dividend_id)) {
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

      const dividend = DividendModel.findById(req.body.dividend_id)
      if (dividend) {
        dividend.enabled = true
        dividend.authorizedby = token.data.id
        await dividend.save()

        return res.status(HttpStatus.OK).json({ status: 'success', message: 'Schedule enabled successfully', data: dividend });
      }
      return res.status(HttpStatus.NOT_FOUND).json({ status: 'failed', message: 'Schedule not found' });
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
   * Disable a dividend
   * @param {string} email
   * @param {string} password
   *
   * @return {object} user
   */
  async disable(req, res, next) {
    try {
      if (paramsNotValid(req.body.dividend_id)) {
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

      const dividend = DividendModel.findById(req.body.dividend_id)
      if (dividend) {
        dividend.enabled = false
        dividend.disabledby = token.data.id
        await dividend.save()

        return res.status(HttpStatus.OK).json({ status: 'success', message: 'Schedule disabled successfully', data: dividend });
      }
      return res.status(HttpStatus.NOT_FOUND).json({ status: 'failed', message: 'Schedule not found' });
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
  }
};

module.exports = DividendController;
