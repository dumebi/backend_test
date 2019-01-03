const express = require('express');
const AuthController = require('../controllers/auth')
const UserController = require("../controllers/user");
const sanitize = require("../helpers/sanitization.js");

const router = express.Router();

/**
 * Auth Routes
 */
router.post('/auth/login',sanitize.users(), AuthController.login);
router.post('/auth/send-token', AuthController.sendToken);
router.patch('/auth/reset-pass', AuthController.resetPass);

// /**
//  * User Routes
//  */
router.get('/test', UserController.test);
router.post('/users/add-user', sanitize.users(), UserController.addShareholders);

module.exports = router;
