const express = require('express');
const AuthController = require('./../controllers/AuthController');

const router = express.Router();

router.route('/login').post(AuthController.doLogin);
router.route('/register').post(AuthController.doRegister);

module.exports = router;
