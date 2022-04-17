const express = require('express');
const AuthController = require('./../controllers/AuthController');

const router = express.Router();

router.route('/register').post(AuthController.doRegister);
router.route('/login').post(AuthController.doLogin);
router.route('/change-password').post(AuthController.changePassword);

module.exports = router;
