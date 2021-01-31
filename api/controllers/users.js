const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


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
  const { email, password } = req.body;

  // Check if all data is present
  if (!email || !password) {
    res.status(400).end('Please enter email and password');
  }

  // Check if the user exists
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(400).end('User does not exist');
      }

      // Validate user's password
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (!isMatch) {
            res.status(400).end('Invalid credentials');
          }

          // Create a token
          jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            (err, token) => {
              if (err) {
                throw err;
              }
              // Respond with the token and user info
              res.json({
                token,
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email
                }
              });
            }
          );
        });
    });
}

module.exports.getUser = (req, res, next) => {
  res.end('User info');
}
