const express = require("express");
const AuthController = require("../controllers/auth");
const testController = require("../controllers/test");
const sanitize = require("../helpers/sanitization.js");

const router = express.Router();

/**
 * Auth Routes
 */
router.post("/auth/login", sanitize.users(), AuthController.login);
router.post("/auth/send-token", AuthController.sendToken);
router.patch("/auth/reset-pass", AuthController.resetPass);

// /**
//  * User Routes
//  */
router.get("/test", testController.sample);

module.exports = router;
