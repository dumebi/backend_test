const TeamModel = require('../models/team');
const HttpStatus = require('../helpers/status');
const { getAsync, client } = require('../helpers/redis');
const {
  paramsNotValid, handleError, handleSuccess, paramsNotValidChecker
} = require('../helpers/utils');
const publisher = require('../helpers/rabbitmq');

const TeamController = {
  /**
   * Create Team
   * @description Create a team
   * @param {string} name 
   * @param {string} logo      
   * @param {string} owner
   * @param {string} manager
   * @param {string} stadium
   * @param {string} established
   * @return {object} team
   */
  async create(req, res, next) {
    try {
      if (paramsNotValid(req.body.name, req.body.logo, req.body.owner, req.body.manager, req.body.stadium, req.body.established)) {
        return handleError(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.body.name, req.body.logo, req.body.owner, req.body.manager, req.body.stadium, req.body.established), null)
      }

      const teamFound = await TeamModel.findOne({ name: req.body.name })
      if (teamFound) { return handleError(res, HttpStatus.BAD_REQUEST, 'team already exists', null) }

      const team = new TeamModel({
        name: req.body.name,
        logo: req.body.logo,
        owner: req.body.owner,
        manager: req.body.manager,
        stadium: req.body.stadium,
        established: req.body.established,
      })

      await Promise.all([team.save(), publisher.queue('ADD_OR_UPDATE_TEAM_PREMIER_CACHE', { team })])
      return handleSuccess(res, HttpStatus.OK, 'Team created successfully', team)
    } catch (error) {
      handleError(res, HttpStatus.BAD_REQUEST, 'Could not create team', error)
    }
  },
  /**
   * Get Teams.
   * @description This returns all teams in the Premier League Ecosystem.
   * @return {object[]} teams
   */
  async all(req, res, next) {
    try {
      let teams = {}
      const result = await getAsync('premier_teams');
      // console.log(result)
      if (result != null && JSON.parse(result).length > 0) {
        teams = JSON.parse(result);
      } else {
        allTeams = await TeamModel.find({});
        for (let index = 0; index < allTeams.length; index++) {
          teams[allTeams[index]._id] = allTeams[index]
        }
        await client.set('premier_teams', JSON.stringify(teams));
      }
      return handleSuccess(res, HttpStatus.OK, 'Teams retrieved', Object.values(teams))
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Could not get teams', error)
    }
  },

  /**
     * Get Team
     * @description This returns a team details in thw Premier League Ecosystem.
     * @param   {string}  id  Team's ID
     * @return  {object}  team
     */
  async one(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return handleError(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.params.id), null)
      }
      const _id = req.params.id;
      const team = await TeamModel.findById(_id);

      if (team) {
        return handleSuccess(res, HttpStatus.OK, 'Team retrieved', team)
      }
      return handleError(res, HttpStatus.NOT_FOUND,  'Team not found', null)
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error getting team', error)
    }
  },

  /**
   * Update Team
   * @description This updates a team details in thw Premier League Ecosystem.
   * @param   {string}  id  Team's ID
   * @return {object} team
   */
  async update(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return handleError(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.params.id), null)
      }
      const _id = req.params.id;
      const team = await TeamModel.findByIdAndUpdate(
        _id,
        { $set: req.body },
        { safe: true, multi: true, new: true }
      )
      if (team) {
        await Promise.all([publisher.queue('ADD_OR_UPDATE_TEAM_PREMIER_CACHE', { team })])
        return handleSuccess(res, HttpStatus.OK, 'Team has been updated', team)
      }
      return handleError(res, HttpStatus.NOT_FOUND, 'Team not found', null)
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error updating team', error)
    }
  },

  /**
   * Update Team
   * @description This removes a team details in thw Premier League Ecosystem.
   * @param   {string}  id  Team's ID
   * @return {object} team
   */
  async remove(req, res, next) {
    try {
      if (paramsNotValid(req.params.id)) {
        return handleError(res, HttpStatus.PRECONDITION_FAILED, paramsNotValidChecker(req.params.id), null)
      }
      const _id = req.params.id;
      const team = await TeamModel.findByIdAndRemove(
        _id,
        { safe: true, multi: true, new: true }
      )
      if (team) {
        await Promise.all([publisher.queue('REMOVE_TEAM_PREMIER_CACHE', { _id })])
        return handleSuccess(res, HttpStatus.OK, 'Team has been removed', null)
      }
      return handleError(res, HttpStatus.NOT_FOUND, 'Team not found', null)
    } catch (error) {
      return handleError(res, HttpStatus.BAD_REQUEST, 'Error updating team', error)
    }
  }
};

module.exports = TeamController;
