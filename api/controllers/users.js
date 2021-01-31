const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const User = mongoose.model('User');

module.exports.register = (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if all data is present
  if (!name || !email || !password) {
    res.status(400).end('Please enter all fields');
  }

  // Check if the user exists
  User.findOne({ email })
    .then(user => {
      if (user) return res.status(400).end('User already exists');
    });

  // Create a user
  const newUser = User({
    name,
    email,
    password
  });

  // Hash user's password
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) {
        throw err;
      }
      newUser.password = hash;
      // Save the user and send a meaningful response
      newUser.save()
        .then(user => {
          res.status(201).json({
            user: {
              id: user.id,
              name: user.name,
              email: user.email
            }
          });
        });
    })
  });
}

module.exports.login = (req, res, next) => {
  res.end('Login');
}

module.exports.getUser = (req, res, next) => {
  res.end('User info');
}
