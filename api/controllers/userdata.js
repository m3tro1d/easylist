const mongoose = require('mongoose');
const nodemailer = require('nodemailer');


const Userdata = mongoose.model('Userdata');

module.exports.getVirtues = (req, res, next) => {
  // Find and return user's virtues
  Userdata
    .findById(req.user.data_id)
    .exec((err, userdata) => {
      if (!userdata) { // Check if userdata is found
        sendJsonResponse(res, 404, {
          message: 'Данные пользователя не найдены'
        });
      } else if (err) { // Check for error
        sendJsonResponse(res, 400, err);
      } else { // Send the virtues
        sendJsonResponse(res, 200, userdata.virtues.map(v => {
          return {
            id: v.id,
            name: v.name
          };
        }));
      }
    });
};

module.exports.addVirtue = (req, res, next) => {
  const { name } = req.body;
  if (!name) { // Check if all data is present
    return sendJsonResponse(res, 400, {
      message: 'Введите название категории'
    });
  } else { // Find user's data and add a virtue
    Userdata
      .findById(req.user.data_id)
      .exec((err, userdata) => {
        if (!userdata) { // Check if userdata is found
          sendJsonResponse(res, 404, {
            message: 'Данные пользователя не найдены'
          });
        } else if (err) { // Check for error
          sendJsonResponse(res, 400, err);
        } else { // Add virtue and save the userdata
          const newVirtue = { name };
          const exists = userdata.virtues.findIndex(el => el.name === name);
          if (exists !== -1) { // Check if the such virtue already exists
            sendJsonResponse(res, 400, {
              message: 'Категория уже существует'
            });
          } else {
            userdata.virtues.push(newVirtue);
            userdata.save()
              .then(changedData => { // Respond with the created virtue
                sendJsonResponse(res, 201, 
                  changedData.virtues[changedData.virtues.length - 1]
                );
              })
              .catch(err => { // Check for error
                sendJsonResponse(res, 400, err);
              });
          }
        }
      });
  }
};

module.exports.getOneVirtue = (req, res, next) => {
  sendJsonResponse(res, 200, req.userdata.virtues[req.virtue_index]);
};

module.exports.updateVirtue = (req, res, next) => {
  const { name } = req.body;
  if (!name) {   // Check if all data is present
    sendJsonResponse(res, 400, {
      message: 'Введите название категории'
    });
  } else {       // Update the virtue and save it
    req.userdata.virtues[req.virtue_index] = {
      name: name || req.userdata.virtues[req.virtue_index].name,
    };
    req.userdata.save()
      .then(savedData => { // Return the modified data
        sendJsonResponse(res, 400, savedData.virtues[req.virtue_index]);
      })
      .catch(err => { // Check for error
        sendJsonResponse(res, 400, err);
      });
  }
};

module.exports.deleteVirtue = (req, res, next) => {
  req.userdata.virtues.splice(req.virtue_index, 1);
  req.userdata.save()
    .then(savedData => { // Return null if everything is alrighty
      sendJsonResponse(res, 204, null);
    })
    .catch(err => { // Check for error
      sendJsonResponse(res, 400, err);
    });
};

module.exports.getTasks = (req, res, next) => {
  Userdata
    .findById(req.user.data_id)
    .exec((err, userdata) => {
      if (!userdata) { // Check if userdata is found
        sendJsonResponse(res, 404, {
          message: 'Данные пользователя не найдены'
        });
      } else if (err) { // Check for error
        sendJsonResponse(res, 400, err);
      } else { // Merge the tasks and send them
        sendJsonResponse(res, 200,
          userdata.virtues.reduce((acc, v) => {
            let tasks = v.tasks.map(t => ({
              id: t.id,
              text: t.text,
              virtue: v.name,
              date: t.date
            }));
            return acc.concat(tasks);
          }, [])
        );
      }
    });
};

module.exports.addTask = (req, res, next) => {
  const { text, date } = req.body;
  if (!text) { // Check if all data is present
    sendJsonResponse(res, 400, {
      message: 'Введите текст задачи'
    });
  } else { // Create the task and send it back
    let newTask = { text };
    // Check for optional date
    if (date) {
      newTask.date = Date.parse(date);
    }
    req.userdata.virtues[req.virtue_index].tasks.push(newTask);
    req.userdata.save()
      .then(savedData => {
        const currentVirtue = savedData.virtues[req.virtue_index]
        const lastIndex = currentVirtue.tasks.length - 1;
        sendJsonResponse(res, 201, {
          id: currentVirtue.tasks[lastIndex].id,
          date: currentVirtue.tasks[lastIndex].date,
          text: currentVirtue.tasks[lastIndex].text,
          virtue: currentVirtue.name
        });
      })
      .catch(err => { // Check for error
        sendJsonResponse(res, 400, err);
      });
  }
};

module.exports.deleteTask = (req, res, next) => {
  const taskIndex = req.userdata.virtues[req.virtue_index].tasks.find(el => 
    el.id === req.params.taskId
  );
  if (taskIndex === -1) { // Check if the task is found
    sendJsonResponse(res, 404, {
      message: 'Задача не найдена'
    });
  } else { // Otherwise, yeet it
    req.userdata.virtues[req.virtue_index].tasks.splice(taskIndex, 1);
    req.userdata.save()
      .then(savedData => { // Return null if everything is alrighty
        sendJsonResponse(res, 204, null);
      })
      .catch(err => { // Check for error
        sendJsonResponse(res, 400, err);
      });
  }
};

module.exports.sendSurvey = (req, res, next) => {
  Userdata
    .findById(req.user.data_id)
    .exec((err, userdata) => {
      if (!userdata) { // Check if userdata is found
        sendJsonResponse(res, 404, {
          message: 'Данные пользователя не найдены'
        });
      } else if (err) { // Check for error
        sendJsonResponse(res, 400, err);
      } else {
        // Merge the tasks altogether
        let tasksArray = userdata.virtues.reduce((acc, v) => {
          let tasks = v.tasks.map(t => ({
            id: t.id,
            text: t.text,
            virtue: v.name,
            date: t.date
          }));
          return acc.concat(tasks);
        }, [])
        // Filter by date
        let tasksFiltered = tasksArray.filter(t => isToday(t.date));
        // Send them
        sendSurvey(
          `Do Not Reply easylist <${process.env.VER_ADDRESS}>`,
          req.user.email,
          'Ваши задачи на сегодня',
          formSurvey(tasksFiltered)
        ).then(info => {
          sendJsonResponse(res, 200, {
            message: 'Отправлено успешно'
          });
        }).catch(err => {
            sendJsonResponse(res, 400, err);
          });
      }
    });
};


// Some useful functions

// Ends res with given status and json content
function sendJsonResponse(res, status, content) {
  res.status(status).json(content);
}

// Returns true if the date is today
function isToday(date) {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

// Formats the tasks in a pretty way
function formSurvey(tasks) {
  let result = 'Привет! Ваши задания на сегодня:\n';
  for (t of tasks) {
    result += `${t.virtue}: ${t.text}\n`;
  }
  if (tasks) {
    result += '\nТак держать!\n';
  } else {
    result += '\nНе очень много, не так ли?\n'
  }
  return result;
}

// Sends an email survey
function sendSurvey(from, to, subject, text) {
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
