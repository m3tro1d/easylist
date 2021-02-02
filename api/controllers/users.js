const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


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
      } else {
        // Hash user's password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
              throw err;
            }
            // Get the confirmation token
            jwt.sign({ email: email, password: hash }, process.env.VER_JWT_SECRET, { expiresIn: '1d' }, (err, token) => {
              if (err) {
                throw err
              }
              sendConfirmation(
                `Do Not Reply easylist <${process.env.VER_ADDRESS}>`,
                email,
                'Confirm your registration on easylist',
                `To confirm your registration on easylist please click this link:\n${req.protocol}://${req.hostname}/api/users/register/confirm?token=${token}`,
                (err, info) => {
                  if (err) {
                    return res.status(400).end('Registration failed');
                  } else {
                    return res.status(201).end('Confirmation email has been sent');
                  }
                });
            });
          });
        });
      }
    });
}

module.exports.registerConfirm = (req, res, next) => {
  // Check if token is present
  if (!req.query.token) {
    return res.status(400).end('No token provided');
  }

  try {
    // Verify the token
    const newUserPlain = jwt.verify(req.query.token, process.env.VER_JWT_SECRET);

    // Check if the user has already been registered
    User.findOne({ email: newUserPlain.email })
      .then(user => {
        if (user) {
          return res.status(400).end('User already registered');
        } else {
          // Save the user and user's data
          const newUserdata = Userdata();
          const newUser = User({
            email: newUserPlain.email,
            password: newUserPlain.password,
            data_id: newUserdata.id
          });
          newUser.save()
            .then(user => {
              newUserdata.save()
                .then(userdata => {
                  // Redirect to the index page
                  return res.redirect(302, '/');
                });
            });
        }
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
      } else {
        // Validate user's password
        bcrypt.compare(password, user.password)
          .then(isMatch => {
            if (!isMatch) {
              return res.status(400).end('Invalid credentials');
            } else {
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
            }
          });
      }
    });
}

module.exports.getUser = (req, res, next) => {
  User.findById(req.user.id)
    .then(user => {
      if (!user) {
        return res.status(400).end('User does not exist');
      } else {
        res.json({
          id: user.id,
          email: user.email,
          data_id: user.data_id
        });
      }
    });
}


// Some useful functions
function sendConfirmation(from, to, subject, text, callback) {
  // Set up the mail client
  const emailer = nodemailer.createTransport({
    pool: true,
    host: 'smtp.mail.ru',
    port: 465,
    secure: true,
    auth: {
      user: process.env.VER_ADDRESS,
      pass: process.env.VER_PASSWORD
    }
  });

  // Prepare the message
  const mailOptions = { from, to, subject, text };

  // Send the message
  emailer.sendMail(mailOptions, callback);
}
