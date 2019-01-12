const express = require('express');
const AuthController = require('../controllers/auth')
const UserController = require('../controllers/user');
const middleware = require('../helpers/middleware')
// const sanitize = require("../helpers/sanitization.js");

const router = express.Router();

/**
 * Auth Routes
 */
router.get('/users/token', AuthController.token);
router.post('/users/create', middleware.isAdmin, AuthController.addUsers);
router.post('/users/login', AuthController.login);
router.post('/users/send-token', AuthController.sendToken);
router.patch('/users/reset-pass', AuthController.resetPass);
router.patch('/users/change-pass', middleware.isUser, AuthController.changePass);
router.patch('/users/activate/:id', AuthController.activate);
router.patch('/users/deactivate/:id', middleware.isAdmin, AuthController.deactivate);


/**
 * User Model routes
 */
router.get('/users/type', middleware.isAdmin, AuthController.types);
router.get('/users/group', middleware.isAdmin, AuthController.groups);
router.get('/users/employment-status', middleware.isAdmin, AuthController.employment);

/**
 * User Profile Routes
 */
router.patch('/users/', middleware.isUser, UserController.update);
router.get('/users/:id', middleware.isUser, UserController.one);
router.get('/users/', middleware.isAdmin, UserController.all);

/**
 * User Exchange Routes
 */
router.get('/users/balance', middleware.isUser, UserController.balance);
router.get('/users/transactions', middleware.isUser, UserController.transactions);
// router.post('/users/fund', middleware.isUser, UserController.fund); // who handles payment?
// router.post('/users/withdraw', middleware.isUser, UserController.withdraw);
// router.post('/users/buy', middleware.isUser, UserController.buy);
// router.post('/users/sell', middleware.isUser, UserController.sell);
// router.post('/users/buy-back', middleware.isUser, UserController.buyBack);

/**
 * Admin Routes
 */
router.patch('/users/:id/type', middleware.isAdmin, UserController.changeType);
router.patch('/users/:id/group', middleware.isAdmin, UserController.changeGroup);
router.patch('/users/:id/employment-status', middleware.isAdmin, UserController.changeEmployment);

module.exports = router;
