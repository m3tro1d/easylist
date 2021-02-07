const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


const Userdata = mongoose.model('Userdata');
const User = mongoose.model('User');

module.exports.register = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) { // Check if all data is present
    sendJsonResponse(res, 400, {
      message: 'Please enter all fields'
    });
  } else {
    User
      .findOne({ email })
      .exec((err, user) => {
        if (user) { // Check if the user already exists
          sendJsonResponse(res, 400, {
            message: 'User already exists'
          });
        } else if (err) { // Check for error
          sendJsonResponse(res, 400, err);
        } else {          // Hash user's password
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {  // Check for error
              sendJsonResponse(res, 400, err);
            } else {    // Generate the registration token
              jwt.sign(
                { email: email, password: hash },
                process.env.VER_JWT_SECRET,
                { expiresIn: '1d' },
                (err, token) => {
                  if (err) { // Check for error
                    sendJsonResponse(res, 400, err);
                  } else {   // Send a confirmation
                    sendConfirmation(
                      `Do Not Reply easylist <${process.env.VER_ADDRESS}>`,
                      email,
                      'Confirm your registration on easylist',
                      `To confirm your registration on easylist please click this link:\n${req.protocol}://${req.hostname}/api/users/register/confirm?token=${token}`,
                      (err, info) => {
                        if (err) { // Check for error
                          sendJsonResponse(res, 400, err);
                        } else {
                          sendJsonResponse(res, 201, {
                            message: 'Confirmation email has been sent'
                          });
                        }
                      });
                  }
                });
            }
          });
        }
      });
  }
};

module.exports.registerConfirm = (req, res, next) => {
  if (!req.query.token) {  // Check if token is present
    sendJsonResponse(res, 400, {
      message: 'No token provided'
    });
  } else {
    try {
      // Verify the token
      const newUserPlain = jwt.verify(req.query.token, process.env.VER_JWT_SECRET);
      User
        .findOne({ email: newUserPlain.email })
        .exec((err, user) => {
          if (user) {       // Check if the user has been registered already
            sendJsonResponse(res, 400, {
              message: 'User already registered'
            });
          } else if (err) { // Check for error
            sendJsonResponse(res, 400, err);
          } else {          // Create the user and user's data
            Userdata
              .create({}, (err, userdata) => {
                if (err) { // Check for error
                  sendJsonResponse(res, 400, err);
                } else {   // Create the user
                  User
                    .create({
                      email: newUserPlain.email,
                      password: newUserPlain.password,
                      data_id: userdata.id
                    }, (err, user) => {
                      if (err) { // Check for error
                        sendJsonResponse(res, 400, err);
                      } else {   // Redirect to the index page
                        res.redirect(302, '/');
                      }
                    });
                }
              });
          }
        });
    } catch(e) { // Catch the invalid token
      sendJsonResponse(res, 400, {
        message: 'Token is invalid'
      });
    }
  }
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {   // Check if all data is present
    sendJsonResponse(res, 400, {
      message: 'Please enter email and password'
    });
  } else {
    User
      .findOne({ email })
      .exec((err, user) => {
        if (!user) {            // Check if the user exists
          sendJsonResponse(res, 404, {
            message: 'User not found'
          });
        } else if (err) {       // Check for error
          sendJsonResponse(res, 400, err);
        } else {
          bcrypt.compare(password, user.password)
            .then(isMatch => {
              if (!isMatch) {   // Check if the password is correct
                sendJsonResponse(res, 400, {
                  message: 'Invalid credentials'
                });
              } else {
                // Create a token
                jwt.sign(
                  { id: user.id },
                  process.env.JWT_SECRET,
                  (err, token) => {
                    if (err) {   // Check for error
                      sendJsonResponse(res, 400, err);
                    } else {     // Respond with the token and user info
                      sendJsonResponse(res, 200, {
                        token,
                        user: {
                          id: user.id,
                          email: user.email,
                          data_id: user.data_id
                        }
                      });
                    }
                  }
                );
              }
            });
        }
      });
  }
};

module.exports.getUser = (req, res, next) => {
  sendJsonResponse(res, 200, {
    id: req.user.id,
    email: req.user.email,
    data_id: req.user.data_id
  });
};


// Some useful functions

// Ends res with given status and json content
function sendJsonResponse(res, status, content) {
  res.status(status).json(content);
}

// Sends a registration confirmation email
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

// Function promisification to avoid callback hell
function promisify(f) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      function callback(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }

      args.push(callback);
      f.call(this, ...args);
    });
  };
}
