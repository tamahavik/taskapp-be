const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'username cannot be empty'],
    },
    email: {
      type: String,
      required: [true, 'email cannot be empty'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'email not valid'],
    },
    photo: String,
    password: {
      type: String,
      required: [true, 'password cannot be empty'],
      minlength: 4,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'password confirmation cannot be empty'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
      },
    },
    createAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    passwordChangeAt: Date,
  },
  { versionKey: false }
);

/**
 * this function only run when save the to database
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 8);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.isValidPassword = async function (
  userPassword,
  databasePassword
) {
  return await bcrypt.compare(userPassword, databasePassword);
};

userSchema.methods.changePasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangeAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    return JWTTimeStamp < changeTimeStamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
