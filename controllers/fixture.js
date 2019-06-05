const FixtureModel = require('../models/fixture');
const HttpStatus = require('../helpers/status');
const utils = require('../helpers/utils');
const {
  paramsNotValid, handleError, handleSuccess, paramsNotValidChecker
} = require('../helpers/utils');

const FixtureController = {
  // fixture_id: { type: Schema.Types.Number },
  //   home: { 
  //     team: { 
  //       type: Schema.Types.ObjectId,
  //       ref: 'Team' 
  //     },
  //     score: { type: Schema.Types.Number }
  //   },
  //   away: { 
  //     team: { 
  //       type: Schema.Types.ObjectId,
  //       ref: 'Team' 
  //     },
  //     score: { type: Schema.Types.Number }
  //   },
  //   status: { type: Schema.Types.String, default: 'Pending' },
  //   date: { type: Schema.Types.String },
  /**
   * Create Team
   * @description Create a team
   * @param {string} home 
   * @param {string} away      
   * @param {string} status
   * @param {string} date
   * @return {object} team
   */
  async create(req, res, next) {
    try {
      if (paramsNotValid(req.body.home, req.body.away, req.body.date)) {
        return handleError(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.body.home, req.body.away, req.body.date), null)
      }

      const fixture = new FixtureModel({
        fixture_id: utils.generateTransactionReference(7),
        home: { team: req.body.home },
        away: { team: req.body.away },
        status: 'Pending',
        date: req.body.date,
      })

      await Promise.all([fixture.save()])
      return handleSuccess(res, HttpStatus.OK, 'Fixture created successfully', fixture)
    } catch (error) {
      handleError(res, HttpStatus.BAD_REQUEST, 'Could not create fixture', error)
    }
  },

  /**
     * Get all Fixtures
     * @description This gets all fixture from the Ecosystem
     * @param   {string}  from  From Date
     * @param   {string}  to  To Date
     * @param   {string}  page  Pagination
     * @param   {string}  count  Number of fixtures per page
     * @param   {string}  status  Pending, Completed, Ongoing
     * @return  {object}  fixtures
     */
  all: async (req, res) => {
    try {
      let { page, count } = req.query
      const {
        from, to, status
      } = req.query
  
      page = parseInt(page, 10)
      count = parseInt(count, 10)
  
      page = req.query.page == null || page <= 0 ? 1 : page
      count = req.query.count == null || count <= 0 ? 50 : count
  
      const query = {}
      if (status) query.status = FixtureModel.Status[status.toUpperCase()]
  
      if (from && to == null) query.createdAt = { $gte: from }
      if (to && from == null) query.createdAt = { $lt: to }
      if (from && to) query.createdAt = { $lt: to, $gte: from }
  
      const all = await Promise.all([
        FixtureModel.find(query).populate('home.team').populate('away.team')
          .skip((page - 1) * count)
          .limit(count)
          .sort({ createdAt: -1 }),
          FixtureModel.estimatedDocumentCount(query)
      ])
  
      const fixtures = all[0]
      const fixturesCount = all[1]
      fixtures.meta = {
        page,
        perPage: count,
        total: fixturesCount,
        pageCount: Math.ceil(fixturesCount / count)
      }
      return handleSuccess(res, HttpStatus.OK, 'Fixtures retrieved', fixtures)
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, error)
    }
  },

  /**
     * Get Fixture
     * @description This gets a fixture from the Premier Ecosystem based off ID
     * @param   {string}  id  Fixture's ID
     * @return  {object}  fixture
     */
  async one(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return handleError(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.params.id), null)
      }
      const _id = req.params.id;
      const fixture = await FixtureModel.findOne({$or: [
        { _id },
        { fixture_id: parseInt(_id, 10) }
    ]});

      if (fixture) {
        return handleSuccess(res, HttpStatus.OK, 'Fixture retrieved', fixture)
      }
      return handleError(res, HttpStatus.NOT_FOUND,  'Fixture not found', null)
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error getting fixture', error)
    }
  },

  /**
     * Get Fixture
     * @description This gets a fixture from the Premier Ecosystem based off ID
     * @param   {string}  id  Fixture's ID
     * @return  {object}  fixture
     */
    async link(req, res, next) {
      try {
        if (paramsNotValid(req.params.id)) {
          return handleError(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.params.id), null)
        }
        const _id = req.params.id;
        const fixture = await FixtureModel.findOne({$or: [
          { _id },
          { fixture_id: _id }
      ]});
  
        if (fixture) {
          return handleSuccess(res, HttpStatus.OK, 'Fixture retrieved', utils.config.host+'/fixtures/'+fixture.fixture_id)
        }
        return handleError(res, HttpStatus.NOT_FOUND,  'Fixture not found', null)
      } catch (error) {
        return handleError(res, HttpStatus.BAD_REQUEST, 'Error getting fixture', error)
      }
    },

  /**
   * Update Fixture
   * @description This updates a fixture details in thw Premier League Ecosystem.
   * @param   {string}  id  Fixture's ID
   * @return {object} fixture
   */
  async update(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return handleError(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.params.id), null)
      }
      delete req.body.home
      delete req.body.away
      const _id = req.params.id;
      const fixture = await FixtureModel.findByIdAndUpdate(
        { _id },
        { $set: req.body },
        { safe: true, multi: true, new: true }
      )
      if (fixture) {
        return handleSuccess(res, HttpStatus.OK, 'Fixture has been updated', fixture)
      }
      return handleError(res, HttpStatus.NOT_FOUND, 'Fixture not found', null)
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error updating fixture', error)
    }
  },

  /**
   * Update Fixture
   * @description This updates a fixture details in thw Premier League Ecosystem.
   * @param   {string}  id  Fixture's ID
   * @return {object} fixture
   */
  async updateScore(req, res, next) {
    try {
      if (paramsNotValid(req.params.id, req.body.home, req.body.away)) {
        return handleError(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.body.id, req.body.home, req.body.away), null)
      }
      const _id = req.params.id;
      const fixture = await FixtureModel.findByIdAndUpdate(
        { _id },
        { 'home.score': req.body.home, 'away.score': req.body.away },
        { safe: true, multi: true, new: true }
      )
      if (fixture) {
        return handleSuccess(res, HttpStatus.OK, 'Fixture has been updated', fixture)
      }
      return handleError(res, HttpStatus.NOT_FOUND, 'Fixture not found', null)
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error updating fixture', error)
    }
  },

  /**
   * Update Fixture
   * @description This removes a fixture details in thw Premier League Ecosystem.
   * @param   {string}  id  Fixture's ID
   * @return {object} fixture
   */
  async remove(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return handleError(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.params.id), null)
      }
      const _id = req.params.id;
      const fixture = await FixtureModel.findByIdAndRemove(
          { _id },
        { safe: true, multi: true, new: true }
      )
      if (fixture) {
        return handleSuccess(res, HttpStatus.OK, 'Fixture has been removed', null)
      }
      return handleError(res, HttpStatus.NOT_FOUND, 'Fixture not found', null)
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error updating fixture', error)
    }
  }
};

module.exports = FixtureController;