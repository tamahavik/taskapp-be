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

exports.doRegister = CatchAsync(async (req, res, next) => {
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

exports.changePassword = CatchAsync(async (req, res, next) => {
  const userWithNewPassword = req.body;
  if (userWithNewPassword.newPassword !== userWithNewPassword.confirmPassword) {
    next(new Exception('New Password and Confirm Password not match!', 400));
  }

  const userDB = await User.findOne({ email: userWithNewPassword.email });

  if (!userDB) {
    next(new Exception('User not found', 400));
  }

  const validPassword = await Bcrypt.comparePassword(
    userWithNewPassword.oldPassword,
    userDB.password
  );

  if (validPassword) {
    userDB.password = await Bcrypt.cryptPassword(
      userWithNewPassword.newPassword
    );

    await User.findOneAndUpdate({ email: userWithNewPassword.email }, userDB);

    res.status(200).json({
      status: 'OK',
      message: 'Password has been change',
    });
  } else {
    next(new Exception('Invalid password', 400));
  }
});
