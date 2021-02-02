const express = require('express');
const logger = require('morgan');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Connect to database
require('./api/models/db');

// API routers
const usersRouter = require('./api/routers/users');
const userdataRouter = require('./api/routers/userdata');

const app = express();

// App settings
app.set('port', process.env.PORT);

// Middleware
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api/users', usersRouter);
app.use('/api/userdata', userdataRouter);

// Provide static assets route in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('/', (req, res, next) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// Pass a 404 error
app.use((req, res, next) => {
  next(createError(404));
});

// Handle errors
app.use((err, req, res, next) => {
  let status = err.status || 500;

  res.locals.message = err.message;
  res.locals.status = status;

  res.status(status);
  res.end(err.message);
});

app.listen(app.get('port'), () => console.log(`Server listening on port ${app.get('port')}.`));
