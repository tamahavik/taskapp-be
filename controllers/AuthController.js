const Exception = require('../utils/Exception');
const User = require('./../models/UserModel');
const Bcrypt = require('./../utils/Bcrypt');
const CatchAsync = require('./../utils/CatchAsync');

exports.doLogin = CatchAsync(async (req, res, next) => {
  const userDatabase = await User.findOne({ email: req.body.email }).select(
    '-__v'
  );

  if (!userDatabase) {
    next(new Exception('Invalid Credentials', 404));
  }
  const validPassword = await Bcrypt.comparePassword(
    req.body.password,
    userDatabase.password
  );

  if (validPassword) {
    userDatabase.password = undefined;
    res.status(200).json({
      status: 'OK',
      data: userDatabase,
    });
  } else {
    next(new Exception('Invalid Credentials', 404));
  }
});

exports.doRegister = CatchAsync(async (req, res) => {
  let password = req.body.password;
  const hash = await Bcrypt.cryptPassword(password);
  req.body.password = hash;
  const newUser = await User.create(req.body);
  newUser.password = undefined;
  res.status(200).json({
    status: 'OK',
    result: newUser,
  });
});
