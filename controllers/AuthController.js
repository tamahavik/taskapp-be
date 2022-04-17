const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Exception = require('../utils/Exception');
const User = require('./../models/UserModel');
const CatchAsync = require('./../utils/CatchAsync');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

exports.doRegister = CatchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'OK',
    token: token,
    data: newUser,
  });
});

exports.doLogin = CatchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new Exception('email and password must be provided!', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.isValidPassword(password, user.password))) {
    return next(new Exception('invalid credentials', 400));
  }

  const token = signToken(user._id);
  res.status(200).json({
    status: 'OK',
    token: token,
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

exports.protect = CatchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new Exception(
        'you not authorized to access this page, please login again!',
        401
      )
    );
  }

  const decode = promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await currentUser.findById(decode.id);
  if (!currentUser) {
    return next(
      new Exception(
        'you not authorized to access this page, please login again!',
        401
      )
    );
  }

  if (currentUser.changePasswordAfter(decode.iat)) {
    return next(
      new Exception(
        'you not authorized to access this page, please login again!',
        401
      )
    );
  }
  req.user = currentUser;
  next();
});
