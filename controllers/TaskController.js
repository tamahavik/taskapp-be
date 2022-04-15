const Task = require('./../models/TaskModel');
const APIFeature = require('./../utils/APIFeature');

exports.getAllTask = async (req, res) => {
  try {
    const feature = new APIFeature(Task.find(), req.query)
      .filter()
      .sort()
      .limit()
      .pagination();
    const tasks = await feature.query;

    res.status(200).json({
      status: 'OK',
      result: tasks,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Bad Request',
      message: err,
    });
  }
};

exports.createTask = async (req, res) => {
  try {
    const newTask = await Task.create(req.body);
    res.status(200).json({
      status: 'OK',
      result: newTask,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Bad Request',
      message: err,
    });
  }
};

exports.submitTask = async (req, res) => {};
