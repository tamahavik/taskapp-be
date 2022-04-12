const User = require('../models/UserModel');
const APIFeature = require('./../utils/APIFeature');

exports.alliasTopUser = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-createAt';
  req.query.fields = 'username, email, password';
  next();
};

exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);

    res.status(200).json({
      status: 'OK',
      result: newUser,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Bad Request',
      message: err,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'OK',
      result: updatedUser,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Bad Request',
      message: err,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'OK',
      message: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Bad Request',
      message: err,
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      res.status(200).json({
        status: 'OK',
        result: user,
      });
    } else {
      res.status(404).json({
        status: 'Not Found',
        message: 'User not found',
      });
    }
  } catch (err) {
    res.status(400).json({
      result: 'bad request',
      message: err,
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const feature = new APIFeature(User.find(), req.query)
      .filter()
      .sort()
      .limit()
      .pagination();
    const users = await feature.query;

    res.status(200).json({
      status: 'OK',
      result: users,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Bad Request',
      message: err,
    });
  }
};
