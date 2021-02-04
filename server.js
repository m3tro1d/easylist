const express = require('express');
const logger = require('morgan');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const http = require('http');
const path = require('path');

// Connect to database
require('./api/models/db');

// API routers
const usersRouter = require('./api/routers/users');
const userdataRouter = require('./api/routers/userdata');


const app = express();

// App settings
app.set('port', resolvePort(process.env.PORT || '5000'));
app.set('env', process.env.NODE_ENV);

// Middleware
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// API routes
app.use('/api/users', usersRouter);
app.use('/api/userdata', userdataRouter);

// Provide static assets route in production
if (app.get('env') === 'production') {
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
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(status);
  res.end(err.message);
});

// Start the server
const server = http.createServer(app);
server.listen(app.get('port'));
server.on('error', onError);
server.on('listening', onListening);


// Functions

// Returns a proper port value
function resolvePort(value) {
  const port = parseInt(value, 10);
  if (isNaN(port)) {
    return value; // Pipe
  }
  if (port >= 0) {
    return port; // Number
  }
  return false; // None of the above
}

// Handler for the 'error' server event
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof app.get('port') === 'string'
    ? 'Pipe ' + app.get('port')
    : 'Port ' + app.get('port');

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

// Handler for the 'listening' server event
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}
