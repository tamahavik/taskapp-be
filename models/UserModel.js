const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'username cannot be empty'],
  },
  email: {
    type: String,
    required: [true, 'email cannot be empty'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'password cannot be empty'],
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
