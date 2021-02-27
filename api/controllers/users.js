const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const utils = require('./_utils.js');


const Userdata = mongoose.model('Userdata');
const User = mongoose.model('User');

const jwtSignPromise = utils.promisify(jwt.sign);
const oAuthClient = new OAuth2Client(process.env.CLIENT_ID);

module.exports.register = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) { // Check if all data is present
    utils.sendJsonResponse(res, 400, {
      message: 'Введите почту и пароль'
    });
  } else {
    User
      .findOne({ email })
      .exec((err, user) => {
        if (user) { // Check if the user already exists
          utils.sendJsonResponse(res, 400, {
            message: 'Пользователь уже существует'
          });
        } else if (err) { // Check for error
          utils.sendJsonResponse(res, 400, err);
        } else {          // Hash user's password
          bcrypt.hash(password, 10)
            .then(hash => {
              return jwtSignPromise({ email, password: hash }, process.env.VER_JWT_SECRET);
            })
            .then(token => utils.sendMail(
              `Do Not Reply easylist <${process.env.VER_ADDRESS}>`,
              email,
              'Пожалуйста, подтвердите регистрацию на easylist',
              'Чтобы подтвердить регистрацию, перейдите по ссылке:'
              + `\n${req.protocol}://${req.hostname}/api/users/register/confirm?token=${token}`)
            )
            .then(info => {
              utils.sendJsonResponse(res, 201, {
                message: 'Письмо для подтверждения отправлено'
              });
            })
            .catch(err => { // Catch all errors
              utils.sendJsonResponse(res, 400, err);
            });
        }
      });
  }
};

module.exports.registerConfirm = (req, res, next) => {
  if (!req.query.token) {  // Check if token is present
    utils.sendJsonResponse(res, 400, {
      message: 'Неверный токен'
    });
  } else {
    // Verify the token
    const jwtVerifyPromise = utils.promisify(jwt.verify);
    jwtVerifyPromise(req.query.token, process.env.VER_JWT_SECRET)
      .then(decodedUser => {
        User.findOne({ email: decodedUser.email })
          .exec((err, user) => {
            if (user) {
              utils.sendJsonResponse(res, 400, {
                message: 'Пользователь уже зарегистрирован'
              });
            } else if (err) {
              utils.sendJsonResponse(res, 400, err);
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
                  utils.sendJsonResponse(res, 400, err);
                });
            }
          });
      })
      .catch(err => {
        utils.sendJsonResponse(res, 400, err);
      });
  }
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {   // Check if all data is present
    utils.sendJsonResponse(res, 400, {
      message: 'Введите почту и пароль'
    });
  } else {
    User
      .findOne({ email })
      .exec((err, user) => {
        if (!user) {            // Check if the user exists
          utils.sendJsonResponse(res, 404, {
            message: 'Пользователь не найден'
          });
        } else if (err) {       // Check for error
          utils.sendJsonResponse(res, 400, err);
        } else {
          bcrypt.compare(password, user.password)
            .then(isMatch => { // Verify user's password
              if (!isMatch) {
                throw { message: 'Неправильные данные для входа' };
              } else {
                return jwtSignPromise({ id: user.id }, process.env.JWT_SECRET);
              }
            })
            .then(token => { // Respond with a token
              utils.sendJsonResponse(res, 200, {
                token,
                user: {
                  id: user.id,
                  email: user.email,
                  data_id: user.data_id
                }
              });
            })
            .catch(err => { // Catch all errors
              utils.sendJsonResponse(res, 400, err);
            });
        }
      });
  }
};

module.exports.googleLogin = (req, res, next) => {
  oAuthClient
    .verifyIdToken({ idToken: req.body.tokenId, audience: process.env.CLIENT_ID })
    .then(authRes => { // Decode the token and verify the user
      const { email } = authRes.payload;
      User
        .findOne({ email })
        .exec((err, user) => {
          if (err) { // Check for errors
            utils.sendJsonResponse(res, 400, err);
          } else if (user) { // User is found, log in
            jwtSignPromise({ id: user.id }, process.env.JWT_SECRET)
              .then(token => {
                utils.sendJsonResponse(res, 200, {
                  token,
                  user: {
                    id: user.id,
                    email: user.email,
                    data_id: user.data_id
                  }
                });
              });
          } else { // User isn't found, register and log in
            bcrypt.hash(utils.generatePassword(), 10)
              .then(hash => {
                Userdata.create({})
                  .then(userdata => User.create({
                    email,
                    password: hash,
                    data_id: userdata.id })
                  )
                  .then(user => {
                    jwtSignPromise({ id: user.id }, process.env.JWT_SECRET)
                      .then(token => {
                        utils.sendJsonResponse(res, 200, {
                          token,
                          user: {
                            id: user.id,
                            email: user.email,
                            data_id: user.data_id
                          }
                        });
                      });
                  })
              })
              .catch(err => {
                utils.sendJsonResponse(res, 400, err);
              });
          }
        });
    })
    .catch(err => { // Catch all errors
      utils.sendJsonResponse(res, 400, err);
    });
};

module.exports.getUser = (req, res, next) => {
  utils.sendJsonResponse(res, 200, {
    id: req.user.id,
    email: req.user.email,
    data_id: req.user.data_id
  });
};

module.exports.getUsersAmount = (req, res, next) => {
  User
    .find({})
    .exec((err, users) => {
      if (err) { // Check for error
        utils.sendJsonResponse(res, 400, err);
      } else {
        utils.sendJsonResponse(res, 200, {
          amount: users.length
        });
      }
    });
}
