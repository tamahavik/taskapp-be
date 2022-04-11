const express = require('express');
const morgan = require('morgan');

const UserRouter = require('./routes/UserRoutes');

const app = express();

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/api/v1/users', UserRouter);

module.exports = app;
