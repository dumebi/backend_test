const express = require('express');
const AuthController = require('../controllers/auth')
const TeamController = require('../controllers/team')
const FixtureController = require('../controllers/fixture')
const UserController = require('../controllers/user')
const middleware = require('../helpers/middleware')

const router = express.Router();

/**
 * Auth Routes
 */
router.post('/users/signup', AuthController.addUsers);
router.post('/users/signin', AuthController.login);
router.post('/users/send-token', AuthController.sendToken);
router.patch('/users/reset-pass', AuthController.resetPass);
// router.patch('/users/change-pass', middleware.isUser, AuthController.changePass);

/** 
 * Admin Premer Routes
 */
router.get('/users', middleware.isAdmin, UserController.all);
router.get('/users/:id', middleware.isAdmin, UserController.one);
router.patch('/users/:id', UserController.update);

router.get('/teams', TeamController.all);
router.get('/teams/:id', TeamController.one);
router.patch('/teams/:id', middleware.isAdmin, TeamController.update);
router.post('/teams', middleware.isAdmin, TeamController.create);
router.delete('/teams/:id', middleware.isAdmin, TeamController.remove);

router.get('/fixtures', FixtureController.all);
router.get('/fixtures/link', middleware.isAdmin, FixtureController.link);
router.get('/fixtures/:id', FixtureController.one);
router.patch('/fixtures/:id', middleware.isAdmin, FixtureController.update);
router.patch('/fixtures/:id/scores', middleware.isAdmin, FixtureController.updateScore);
router.post('/fixtures', middleware.isAdmin, FixtureController.create);
router.delete('/fixtures/:id', middleware.isAdmin, FixtureController.remove);
module.exports = router;
