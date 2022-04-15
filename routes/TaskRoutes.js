const express = require('express');
const TaskController = require('../controllers/TaskController');

const router = express.Router();

router
  .route('/')
  .get(TaskController.getAllTask)
  .post(TaskController.createTask);
router.route('/submit').post(TaskController.submitTask);

module.exports = router;
