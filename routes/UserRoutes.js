const express = require('express');
const userController = require('./../controllers/UserController');

const router = express.Router();

router
  .route('/top-5-user')
  .get(userController.alliasTopUser, userController.getAllUsers);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
