const User = require('./../models/UserModel');
const Bcrypt = require('./../utils/Bcrypt');

exports.doLogin = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(400).json({
      status: 'Bad Request',
      message: err.message,
    });
  }
};
