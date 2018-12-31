var express = require('express');
var router = express.Router();
const UserController = require("../controller/user.js");
const sanitize = require("../helpers/sanitization.js");


/* GET users listing. */
router.post('/', sanitize.users(), UserController.addShareholders);
router.get('/', UserController.fetchShareholders);

module.exports = router;
