const User = require('../models/UserModel');
const APIFeature = require('./../utils/APIFeature');
const CatchAsync = require('./../utils/CatchAsync');
const Exception = require('./../utils/Exception');
const RemovePassword = require('./../utils/RemovePassword');

exports.alliasTopUser = CatchAsync(async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-createAt';
  req.query.fields = 'username, email, password';
  next();
});

exports.updateUser = CatchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'OK',
    result: RemovePassword(updatedUser),
  });
});

exports.deleteUser = CatchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'OK',
    message: null,
  });
});

exports.getUser = CatchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    next(new Exception('User not found', 404));
  }

  res.status(200).json({
    status: 'OK',
    result: RemovePassword(user),
  });
});

exports.getAllUsers = CatchAsync(async (req, res, next) => {
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
});
