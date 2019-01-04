const express = require('express');
const AuthController = require('../controllers/auth')
const UserController = require("../controllers/user");
const middleware = require('../helpers/middleware')
// const sanitize = require("../helpers/sanitization.js");

const router = express.Router();

/**
 * Auth Routes
 */
router.get('/auth/token', AuthController.token);
router.post('/auth/login', AuthController.login);
router.post('/auth/send-token', AuthController.sendToken);
router.patch('/auth/reset-pass', AuthController.resetPass);
router.patch('/auth/create', middleware.isAdmin, AuthController.addUsers);

/**
 * User Routes
 */
router.patch('/users/', middleware.isUser, UserController.update);
router.patch('/users/balance', middleware.isUser, UserController.balance);
router.patch('/users/transactions', middleware.isUser, UserController.transactions);
router.patch('/users/buy', middleware.isUser, UserController.transactions);
router.patch('/users/sell', middleware.isUser, UserController.transactions);
router.patch('/users/buy-back', middleware.isUser, UserController.transactions);
router.get('/users/:id', middleware.isUser, UserController.one);

router.post('/users/', middleware.isAdmin, UserController.all);

module.exports = router;
