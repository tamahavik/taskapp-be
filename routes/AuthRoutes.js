const express = require('express');
const AuthController = require('./../controllers/AuthController');

const router = express.Router();

router.route('/register').post(AuthController.doRegister);
router.route('/login').post(AuthController.doLogin);
router.route('/forgot-password').post(AuthController.forgotPassword);
router.route('/reset-password/:token').patch(AuthController.resetPassword);

module.exports = router;
