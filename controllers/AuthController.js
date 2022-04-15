const User = require('./../models/UserModel');
const Bcrypt = require('./../utils/Bcrypt');
const CatchAsync = require('./../utils/CatchAsync');

exports.doLogin = CatchAsync(async (req, res, next) => {
  const userDatabase = await User.findOne({ email: req.body.email }).select(
    '-__v'
  );

  if (!userDatabase) {
    res.status(404).json({
      status: 'Not Found',
      message: 'User not found',
    });
  }
  const validPassword = Bcrypt.comparePassword(
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
    res.status(404).json({
      status: 'Not Found',
      message: 'Invalid Credentials',
    });
  }
});

exports.doRegister = async (req, res) => {
  try {
    let password = req.body.password;
    const hash = await Bcrypt.cryptPassword(password);
    req.body.password = hash;
    const newUser = await User.create(req.body);
    newUser.password = undefined;
    res.status(200).json({
      status: 'OK',
      result: newUser,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Bad Request',
      message: err.message,
    });
  }
};
