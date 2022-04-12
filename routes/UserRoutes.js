const express = require('express');
const UserController = require('./../controllers/UserController');

const router = express.Router();

router
  .route('/top-5-user')
  .get(userController.alliasTopUser, UserController.getAllUsers);

router
  .route('/')
  .get(UserController.getAllUsers)
  .post(UserController.createUser);

router
  .route('/:id')
  .get(UserController.getUser)
  .patch(UserController.updateUser)
  .delete(UserController.deleteUser);

module.exports = router;
