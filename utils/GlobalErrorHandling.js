const Exception = require('./Exception');

const handleCastError = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new Exception(message, 400);
};

const handleDuplicateError = (err) => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value ${value}, please use another value instead`;
  return new Exception(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((err) => err.message);
  const message = `Invalid input data ${errors.join(', ')}`;
  return new Exception(message, 400);
};

const handleJsonWebTokenError = (error) =>
  new Exception('Invalid token, please login again!', 401);

const handleTokenExpiredError = (err) =>
  new Exception('Token expired, please login again!', 401);

const devError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const prodError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log('ERROR ', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV !== 'production') {
    devError(err, res);
  } else {
    let error = Object.assign(err);
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicateError(error);
    if (error.name === 'ValidationError') error = handleValidationError(error);
    if (error._message && error._message.includes('validation failed'))
      error = handleValidationError(error);
    if (error.name === 'JsonWebTokenError')
      error = handleJsonWebTokenError(error);
    if (error.name === 'TokenExpiredError')
      error = handleTokenExpiredError(error);
    prodError(error, res);
  }
};
