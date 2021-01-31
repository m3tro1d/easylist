const mongoose = require('mongoose');


const User = mongoose.model('User');

module.exports.register = (req, res, next) => {
  res.end('Register');
}

module.exports.login = (req, res, next) => {
  res.end('Login');
}

module.exports.getUser = (req, res, next) => {
  res.end('User info');
}
