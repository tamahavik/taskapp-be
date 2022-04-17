const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
    role: {
      type: String,
      enum: ['head', 'member', 'admin'],
      default: 'member',
    },
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
    passwordResetToken: String,
    passwordResetExpires: Date,
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

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') && this.isNew) return next();
  this.passwordChangeAt = Date.now() - 1000;
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

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
