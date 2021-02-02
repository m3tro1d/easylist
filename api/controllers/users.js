const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const Userdata = mongoose.model('Userdata');
const User = mongoose.model('User');

module.exports.register = (req, res, next) => {
  const { email, password } = req.body;

  // Check if all data is present
  if (!email || !password) {
    return res.status(400).end('Please enter all fields');
  }

  // Check if the user exists
  User.findOne({ email })
    .then(user => {
      if (user) {
        return res.status(400).end('User already exists');
      }
    });

  // Create a user
  const newUserdata = Userdata();
  const newUser = User({
    email,
    password,
    data_id: newUserdata.id
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
          newUserdata.save()
            .then(userdata => {
              return res.status(201).json({
                user: {
                  id: user.id,
                  email: user.email,
                  data_id: user.data_id
                }
              });
            });
        });
    })
  });
}

module.exports.registerConfirm = (req, res, next) => {
  try {
    // Verify the token and save the user
    const newUser = jwt.verify(req.params.token, process.env.VER_JWT_SECRET);
    newUser.save()
      .then(user => {
        // Redirect to the index page
        return res.redirect(302, '/');
      });
  } catch(e) {
    return res.status(400).end('Token is invalid');
  }
}

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  // Check if all data is present
  if (!email || !password)
    return res.status(400).end('Please enter email and password');
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
            return res.status(400).end('Invalid credentials');
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
              return res.json({
                token,
                user: {
                  id: user.id,
                  email: user.email,
                  data_id: user.data_id
                }
              });
            }
          );
        });
    });
}

module.exports.getUser = (req, res, next) => {
  User.findById(req.user.id)
    .then(user => {
      if (!user) {
        return res.status(400).end('User does not exist');
      }

      res.json({
        id: user.id,
        email: user.email,
        data_id: user.data_id
      });
    });
}
