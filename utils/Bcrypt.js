const bcrypt = require('bcrypt');

const saltRounds = 10;

exports.cryptPassword = (password) => {
  return bcrypt.hash(password, saltRounds);
};

exports.comparePassword = (password, hash) => {
  return bcrypt.comparePassword(password, hash, (err, result) => {
    return result;
  });
};
