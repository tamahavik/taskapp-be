const User = require('./../models/UserModel');
const bcrypt = require('bcrypt');

exports.doLogin = async (req, res) => {
  try {
    let userDatabase = await User.findOne({ email: req.body.email });
    if (!userDatabase) {
      res.status(404).json({
        status: 'Not Found',
        message: 'User not found',
      });
    }
    bcrypt.compare(
      req.body.password,
      userDatabase.password,
      (err, validPassword) => {
        if (validPassword) {
          userDatabase.password = '';
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
      }
    );
  } catch (err) {
    res.status(400).json({
      status: 'Bad Request',
      message: err.message,
    });
  }
};
