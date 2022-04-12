const bcrypt = require('bcrypt');

const saltRounds = 10;

exports.cryptPassword = (password) => {
  return bcrypt.hash(password, saltRounds);
};

exports.comparePassword = (password, hash, callbacks) => {
  bcrypt.comparePassword(password, hash, (err, isMatch) => {
    return err == null ? callbacks(null, isMatch) : callbacks(err);
  });
};
