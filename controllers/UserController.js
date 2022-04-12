const { findByIdAndUpdate } = require('../models/UserModel');
const User = require('../models/UserModel');

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
    //filter users
    const queryObject = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObject[el]);

    //less than greater than value
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    let userQuery = User.find(JSON.parse(queryStr));
    //sorting
    if (req.query.sort) {
      const sortBy = req.userQuery.sort.split(',').join(' ');
      userQuery = userQuery.sort(sortBy);
    } else {
      userQuery = userQuery.sort('-createdAt');
    }

    //fields
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      userQuery = userQuery.select(fields);
    } else {
      userQuery = userQuery.select('-__v');
    }

    //pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    //(skip==(page-1)*limit and limit==data per page)
    userQuery = userQuery.skip(skip).limit(limit);
    if (req.query.page) {
      const numUser = await User.countDocuments();
      if (skip >= numUser) throw new Error('This page does not exist');
    }

    const users = await userQuery;

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
