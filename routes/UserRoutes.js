const express = require('express');
const userController = require('./../controllers/UserController');
const { protect, restrictTo } = require('./../controllers/AuthController');

const router = express.Router();

router
  .route('/top-5-user')
  .get(protect, userController.alliasTopUser, userController.getAllUsers);

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(protect, restrictTo('admin', 'head'), userController.deleteUser);

module.exports = router;
