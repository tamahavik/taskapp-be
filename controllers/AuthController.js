const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const Exception = require('../utils/Exception');
const User = require('./../models/UserModel');
const CatchAsync = require('./../utils/CatchAsync');
const sendEmail = require('./../utils/Email');
const crypto = require('crypto');

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

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new Exception('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({ email: email });
  if (!user) {
    return next(new Exception('There is no user with email address', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit PATCH request with your new  password and password confirm to: ${resetUrl}. \n
  if you didn't forget your password, plese ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 mins)',
      message: message,
    });
    res.status(200).json({
      status: 'OK',
      message: 'Please check your email for reset password',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new Exception(
        'There was an error when sending the email, try again later.',
        500
      )
    );
  }
};

exports.resetPassword = CatchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new Exception('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  const token = signToken(user._id);
  res.status(200).json({
    status: 'OK',
    token: token,
  });
});
