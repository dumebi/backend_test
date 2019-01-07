const express = require('express');
const AuthController = require('../controllers/auth')
const UserController = require("../controllers/user");
const middleware = require('../helpers/middleware')
// const sanitize = require("../helpers/sanitization.js");

const router = express.Router();

/**
 * Auth Routes
 */
router.get('/users/token', AuthController.token);
router.post('/users/login', AuthController.login);
router.post('/users/send-token', AuthController.sendToken);
router.patch('/users/reset-pass', AuthController.resetPass);
router.patch('/users/activate/:id', AuthController.activate);
router.patch('/users/create', middleware.isAdmin, AuthController.addUsers);

/**
 * User Model routes
 */
router.get('/users/types', middleware.isAdmin, AuthController.types);
router.get('/users/groups', middleware.isAdmin, AuthController.groups);
router.get('/users/employment-statuses', middleware.isAdmin, AuthController.employment);

/**
 * User Profile Routes
 */
router.patch('/users/', middleware.isUser, UserController.update);
router.get('/users/:id', middleware.isUser, UserController.one);
router.post('/users/', middleware.isAdmin, UserController.all);

/**
 * User Exchange Routes
 */
router.get('/users/balance', middleware.isUser, UserController.balance);
router.get('/users/transactions', middleware.isUser, UserController.transactions);
// router.post('/users/buy', middleware.isUser, UserController.buy);
// router.post('/users/fund', middleware.isUser, UserController.find);
// router.post('/users/withdraw', middleware.isUser, UserController.withdraw);
// router.post('/users/sell', middleware.isUser, UserController.sell);
// router.post('/users/buy-back', middleware.isUser, UserController.buyBack);

module.exports = router;
