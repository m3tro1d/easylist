const mongoose = require('mongoose');
const readline = require('readline');

// Initialize models
require('./Userdata');
require('./User');

const dbUri = process.env.DB_URI;
mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology:true });

// Connection events handling
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to ' + dbUri);
});

mongoose.connection.on('error', err => {
  console.log('Mongoose connection error: ' + err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});


// Emulate SIGINT on windows
if (process.platform === 'win32') {
  let rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.on('SIGINT', () => process.emit('SIGINT'));
}

// Catch termination signal
process.on('SIGINT', () => {
  shutdown('app termination', () => process.exit(0));
});

// For gracefull shutdown
function shutdown(msg, callback) {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected due to ' + msg);
    callback();
  });
}
