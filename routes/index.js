const express = require('express');
const AuthController = require('../controllers/auth')
const UserController = require("../controllers/user.js");
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
router.post('/users/add-user', sanitize.users(), UserController.addShareholders);
router.get('/users', UserController.fetchShareholders);

module.exports = router;
