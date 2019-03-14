const ScheduleModel = require('../models/schedule');
const UserModel = require('../models/user');
const HttpStatus = require('../helpers/status');
const {
  paramsNotValid, generateTransactionReference, checkToken
} = require('../helpers/utils');


const ScheduleController = {
  /**
    * Get Schedules
    * @description Get all schedules
    * @param {string} group   User group
    * @param {string} to      To date
    * @param {string} from    From date
    * @param {string} status  Schedule status
    * @return {object[]} schedules
    */
  async all(req, res, next) {
    try {
      const {
        group, to, from, status
      } = req.query

      const query = { }
      if (status) query.status = ScheduleModel.Status[status.toUpperCase()]
      if (group) query.group = UserModel.UserGroup[group.toUpperCase()]

      if (from && to == null) query.createdAt = { $gte: from }
      if (to && from == null) query.createdAt = { $lt: to }
      if (from && to) query.createdAt = { $lt: to, $gte: from }

      const schedules = await ScheduleModel.find(query).sort({ createdAt: -1 })
      // let schedules = {}
      // const result = await getAsync('STTP_schedules');
      // // console.log(result)
      // if (result != null && JSON.parse(result).length > 0) {
      //   schedules = JSON.parse(result);
      // } else {
      //   for (let index = 0; index < schedules.length; index++) {
      //     schedules[schedules[index]._id] = schedules[index]
      //   }
      //   await client.set('STTP_schedules', JSON.stringify(schedules));
      // }
      return res.status(HttpStatus.OK).json({ status: 'success', message: 'Schedules retrieved', data: schedules });
    } catch (error) {
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not get schedules',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Create Schedule
   * @description Create a schedule
   * @param {string} group  User group
   * @param {string} name   Schedule name
   * @param {string} amount Schedule amount
   * @param {string} date   Schedule amount
   * @param {string} status Schedule status
   *
   * @return {object} schedule
   */
  async create(req, res, next) {
    try {
      if (paramsNotValid(req.body.name, req.body.group, req.body.amount, req.body.date)) {
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
      const schedule = new ScheduleModel({
        scheduleId: generateTransactionReference(),
        name: req.body.name,
        group: req.body.group,
        amount: req.body.amount,
        date: req.body.date,
        enabled: false,
        createdby: token.data.id
      })

      await schedule.save()

      // TODO: create blockchain schedule

      return res.status(HttpStatus.OK).json({ status: 'success', message: 'Schedule created successfully', data: schedule });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not create schedule',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Get Schedule
   * @description Enable a schedule
   * @param {string} schedule_id Schedule ID
   * @return {object} schedule
   */
  async one(req, res, next) {
    try {
      if (paramsNotValid(req.params.schedule_id)) {
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

      const schedule = await ScheduleModel.findById(req.params.schedule_id)
      if (schedule) {
        return res.status(HttpStatus.OK).json({ status: 'success', message: 'Schedule gotten successfully', data: schedule });
      }
      return res.status(HttpStatus.NOT_FOUND).json({ status: 'failed', message: 'Schedule not found' });
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not enable schedule',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Enable Schedule
   * @description Enable a schedule
   * @param {string} schedule_id Schedule ID
   * @return {object} schedule
   */
  async enable(req, res, next) {
    try {
      if (paramsNotValid(req.params.schedule_id)) {
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

      const schedule = await ScheduleModel.findByIdAndUpdate(
        req.params.schedule_id,
        { enabled: true, authorizedby: token.data.id },
        { safe: true, multi: true, new: true }
      )
      if (schedule) {
        return res.status(HttpStatus.OK).json({ status: 'success', message: 'Schedule enabled successfully', data: schedule });
      }
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: 'Schedule not found',
      })
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not enable schedule',
        devError: error
      }
      next(err)
    }
  },

  /**
   * Disable Schedule
   * @description Disable a schedule
   * @param {string} schedule_id Schedule ID
   * @return {object} user
   */
  async disable(req, res, next) {
    try {
      if (paramsNotValid(req.params.schedule_id)) {
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

      const schedule = await ScheduleModel.findByIdAndUpdate(
        req.params.schedule_id,
        { enabled: false, disabledby: token.data.id },
        { safe: true, multi: true, new: true }
      )
      if (schedule) {
        return res.status(HttpStatus.OK).json({ status: 'success', message: 'Schedule disabled successfully', data: schedule });
      }
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: 'Schedule not found',
      })
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Could not disable schedule',
        devError: error
      }
      next(err)
    }
  },

  /**
     * Update Schedule
     * @description Update a schedule
     * @param {string} group        User group
     * @param {string} name         Schedule name
     * @param {string} amount       Schedule amount
     * @param {string} date         Schedule date
     * @param {string} status       Schedule status
     * @param {string} schedule_id  Schedule ID
     * @return {object} schedule
     */
  async update(req, res, next) {
    try {
      if (paramsNotValid(req.params.schedule_id)) {
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
      delete req.body.scheduleId
      delete req.body.enabled
      delete req.body.createdby
      delete req.body.authorizedby
      delete req.body.disabledby
      const schedule = await ScheduleModel.findByIdAndUpdate(
        req.params.schedule_id,
        { $set: req.body },
        { safe: true, multi: true, new: true }
      )
      if (schedule) {
        return res.status(HttpStatus.OK).json({
          status: 'success',
          message: 'Schedule has been updated',
          data: schedule
        })
      }
      return res.status(HttpStatus.NOT_FOUND).json({
        status: 'failed',
        message: 'Schedule not found',
      })
    } catch (error) {
      console.log('error >> ', error)
      const err = {
        http: HttpStatus.BAD_REQUEST,
        status: 'failed',
        message: 'Error updating schedule',
        devError: error
      }
      next(err)
    }
  },
};

module.exports = ScheduleController;
