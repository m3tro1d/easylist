const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


// Set up models
const Userdata = mongoose.model('Userdata');
const User = mongoose.model('User');

// Set up email client
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
      // Get the confirmation token
      jwt.sign(
        newUser,
        process.env.VER_JWT_SECRET,
        { expiresIn: '1d' },
        (err, token) => {
          if (err) {
            throw err
          }
          const mailOptions = {
            from: `easylist NOREPLY <${process.env.VER_ADDRESS}>`,
            to: newUser.email,
            subject: 'Confirm registration on easylist',
            text: `To confirm your registration on easylist please click this link:\nhttps://${req.hostname}/api/users/register/confirm?token=${token}`
          };
          emailer.sendMail(mailOptions, (err, info) => {
            if (err) {
              return res.status(400).end('Registration failed');
            }
            return res.end('Confirmation email has been sent');
          })
        }
      );
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
