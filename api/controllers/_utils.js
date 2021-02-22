const nodemailer = require('nodemailer');


// Ends res with given status and json content
module.exports.sendJsonResponse = (res, status, content) => {
  res.status(status).json(content);
};

// Returns true if the date is today
module.exports.isToday = date => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

// Formats the tasks in a pretty way
module.exports.formSurvey = tasks => {
  let result = 'Привет! Ваши задания на сегодня:\n';
  for (let t of tasks) {
    result += `${t.virtue}: ${t.text}\n`;
  }
  if (tasks) {
    result += '\nТак держать!\n';
  } else {
    result += '\nНе очень много, не так ли?\n';
  }
  return result;
};

// Sends an email
module.exports.sendMail = (from, to, subject, text) => {
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
};

// Function promisification to avoid callback hell
module.exports.promisify = f => {
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
};

// Returns a randomly generated password
module.exports.generatePassword = () => {
  // Last 8 characters of the random number converted to base-36
  return Math.random().toString(36).slice(-8);
};
