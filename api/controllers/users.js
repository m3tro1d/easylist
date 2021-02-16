const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');


const Userdata = mongoose.model('Userdata');
const User = mongoose.model('User');

const oAuthClient = new OAuth2Client(process.env.CLIENT_ID);

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
          bcrypt.hash(password, 10)
            .then(hash => {
              const jwtSignPromise = promisify(jwt.sign);
              return jwtSignPromise({ email, password: hash }, process.env.VER_JWT_SECRET);
            })
            .then(token => sendConfirmation(
              `Do Not Reply easylist <${process.env.VER_ADDRESS}>`,
              email,
              'Confirm your registration on easylist',
              'To confirm your registration on easylist please click this link:'
              + `\n${req.protocol}://${req.hostname}/api/users/register/confirm?token=${token}`)
            )
            .then(info => {
              sendJsonResponse(res, 201, {
                message: 'Confirmation email has been sent'
              });
            })
            .catch(err => { // Catch all errors
              sendJsonResponse(res, 400, err);
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
    // Verify the token
    const jwtVerifyPromise = promisify(jwt.verify);
    jwtVerifyPromise(req.query.token, process.env.VER_JWT_SECRET)
      .then(decodedUser => {
        User.findOne({ email: decodedUser.email })
          .exec((err, user) => {
            if (user) {
              sendJsonResponse(res, 400, {
                message: 'User already registered'
              });
            } else if (err) {
              sendJsonResponse(res, 400, err);
            } else {
              Userdata.create({})
                .then(userdata => User.create({
                  email: decodedUser.email,
                  password: decodedUser.password,
                  data_id: userdata.id })
                )
                .then(user => {
                  res.redirect(302, '/');
                })
                .catch(err => {
                  sendJsonResponse(res, 400, err);
                });
            }
          });
      })
      .catch(err => {
        sendJsonResponse(res, 400, err);
      });
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
            .then(isMatch => { // Verify user's password
              if (!isMatch) {
                sendJsonResponse(res, 400, {
                  message: 'Invalid credentials'
                });
              } else {
                const jwtSignPromise = promisify(jwt.sign);
                return jwtSignPromise({ id: user.id }, process.env.JWT_SECRET);
              }
            })
            .then(token => { // Respond with a token
              sendJsonResponse(res, 200, {
                token,
                user: {
                  id: user.id,
                  email: user.email,
                  data_id: user.data_id
                }
              });
            })
            .catch(err => { // Catch all errors
              sendJsonResponse(res, 400, err);
            });
        }
      });
  }
};

module.exports.googleLogin = (req, res, next) => {
  const { token } = req.body;
  oAuthClient
    .verifyIdToken({ idToken: token, audience: process.env.CLIENT_ID })
    .then(authRes => { // Decode the token and verify the user
      const { email_verified, email } = authRes.body;
      User
        .findOne({ email })
        .exec((err, user) => {
          if (err) { // Check for errors
            sendJsonResponse(res, 400, err);
          } else if (user) { // Userd is found, log in
            const jwtSignPromise = promisify(jwt.sign);
            jwtSignPromise({ id: user.id }, process.env.JWT_SECRET)
              .then(token => {
                sendJsonResponse(res, 200, {
                  token,
                  user: {
                    id: user.id,
                    email: user.email,
                    data_id: user.data_id
                  }
                });
              });
          } else { // User isn't found, register and log in
            Userdata.create({})
              .then(userdata => User.create({
                email: user.email,
                password: generatePassword(),
                data_id: userdata.id })
              )
              .then(user => {
                sendJsonResponse(res, 200, {
                  token,
                  user: {
                    id: user.id,
                    email: user.email,
                    data_id: user.data_id
                  }
                });
              })
              .catch(err => {
                sendJsonResponse(res, 400, err);
              });
          }
        });
    })
    .catch(err => { // Catch all errors
      sendJsonResponse(res, 400, err);
    });
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
function sendConfirmation(from, to, subject, text) {
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
  return new Promise((resolve, reject) => {
    emailer.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
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

// Returns a randomly generated password
function generatePassword() {
  // Last 8 characters of the random number converted to base-36
  return Math.random().toString(36).slice(-8);
}
