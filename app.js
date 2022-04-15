const express = require('express');
const morgan = require('morgan');

const Exception = require('./utils/Exception');
const ErrorHandling = require('./utils/ErrorHandling');
const UserRouter = require('./routes/UserRoutes');
const AuthRouter = require('./routes/AuthRoutes');
const TaskRouter = require('./routes/TaskRoutes');

const app = express();

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/api/v1/users', UserRouter);
app.use('/api/v1/auth', AuthRouter);
app.use('/api/v1/tasks', TaskRouter);

/**
 * this is for not found handling middleware
 */
app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: 'Not Found',
  //   message: `cant find path ${req.originalUrl} in the server`,
  // });

  // const err = new Error(`cant find path ${req.originalUrl} in the server`);
  // err.statusCode = 404;
  // err.status = 'Not Found';

  //next(err) if next have param then that sign of error
  const err = new Exception(
    `cant find path ${req.originalUrl} in the server`,
    404
  );
  next(err);
});

/**
 * this is for error handling middleware
 */
app.use(ErrorHandling);

module.exports = app;
