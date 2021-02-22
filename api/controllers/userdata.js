const mongoose = require('mongoose');

const utils = require('./_utils.js');


const Userdata = mongoose.model('Userdata');

module.exports.getVirtues = (req, res, next) => {
  // Find and return user's virtues
  Userdata
    .findById(req.user.data_id)
    .exec((err, userdata) => {
      if (!userdata) { // Check if userdata is found
        utils.sendJsonResponse(res, 404, {
          message: 'Данные пользователя не найдены'
        });
      } else if (err) { // Check for error
        utils.sendJsonResponse(res, 400, err);
      } else { // Send the virtues
        utils.sendJsonResponse(res, 200, userdata.virtues.map(v => {
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
    return utils.sendJsonResponse(res, 400, {
      message: 'Введите название категории'
    });
  } else { // Find user's data and add a virtue
    Userdata
      .findById(req.user.data_id)
      .exec((err, userdata) => {
        if (!userdata) { // Check if userdata is found
          utils.sendJsonResponse(res, 404, {
            message: 'Данные пользователя не найдены'
          });
        } else if (err) { // Check for error
          utils.sendJsonResponse(res, 400, err);
        } else { // Add virtue and save the userdata
          const newVirtue = { name };
          const exists = userdata.virtues.findIndex(el => el.name === name);
          if (exists !== -1) { // Check if the such virtue already exists
            utils.sendJsonResponse(res, 400, {
              message: 'Категория уже существует'
            });
          } else {
            userdata.virtues.push(newVirtue);
            userdata.save()
              .then(changedData => { // Respond with the created virtue
                utils.sendJsonResponse(res, 201, 
                  changedData.virtues[changedData.virtues.length - 1]
                );
              })
              .catch(err => { // Check for error
                utils.sendJsonResponse(res, 400, err);
              });
          }
        }
      });
  }
};

module.exports.getOneVirtue = (req, res, next) => {
  utils.sendJsonResponse(res, 200, req.userdata.virtues[req.virtue_index]);
};

module.exports.updateVirtue = (req, res, next) => {
  const { name } = req.body;
  if (!name) {   // Check if all data is present
    utils.sendJsonResponse(res, 400, {
      message: 'Введите название категории'
    });
  } else {       // Update the virtue and save it
    req.userdata.virtues[req.virtue_index] = {
      name: name || req.userdata.virtues[req.virtue_index].name,
    };
    req.userdata.save()
      .then(savedData => { // Return the modified data
        utils.sendJsonResponse(res, 400, savedData.virtues[req.virtue_index]);
      })
      .catch(err => { // Check for error
        utils.sendJsonResponse(res, 400, err);
      });
  }
};

module.exports.deleteVirtue = (req, res, next) => {
  req.userdata.virtues.splice(req.virtue_index, 1);
  req.userdata.save()
    .then(savedData => { // Return null if everything is alrighty
      utils.sendJsonResponse(res, 204, null);
    })
    .catch(err => { // Check for error
      utils.sendJsonResponse(res, 400, err);
    });
};

module.exports.getTasks = (req, res, next) => {
  Userdata
    .findById(req.user.data_id)
    .exec((err, userdata) => {
      if (!userdata) { // Check if userdata is found
        utils.sendJsonResponse(res, 404, {
          message: 'Данные пользователя не найдены'
        });
      } else if (err) { // Check for error
        utils.sendJsonResponse(res, 400, err);
      } else { // Merge the tasks and send them
        utils.sendJsonResponse(res, 200,
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
    utils.sendJsonResponse(res, 400, {
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
        const currentVirtue = savedData.virtues[req.virtue_index];
        const lastIndex = currentVirtue.tasks.length - 1;
        utils.sendJsonResponse(res, 201, {
          id: currentVirtue.tasks[lastIndex].id,
          date: currentVirtue.tasks[lastIndex].date,
          text: currentVirtue.tasks[lastIndex].text,
          virtue: currentVirtue.name
        });
      })
      .catch(err => { // Check for error
        utils.sendJsonResponse(res, 400, err);
      });
  }
};

module.exports.deleteTask = (req, res, next) => {
  const taskIndex = req.userdata.virtues[req.virtue_index].tasks.find(el => 
    el.id === req.params.taskId
  );
  if (taskIndex === -1) { // Check if the task is found
    utils.sendJsonResponse(res, 404, {
      message: 'Задача не найдена'
    });
  } else { // Otherwise, yeet it
    req.userdata.virtues[req.virtue_index].tasks.splice(taskIndex, 1);
    req.userdata.save()
      .then(savedData => { // Return null if everything is alrighty
        utils.sendJsonResponse(res, 204, null);
      })
      .catch(err => { // Check for error
        utils.sendJsonResponse(res, 400, err);
      });
  }
};

module.exports.sendSurvey = (req, res, next) => {
  Userdata
    .findById(req.user.data_id)
    .exec((err, userdata) => {
      if (!userdata) { // Check if userdata is found
        utils.sendJsonResponse(res, 404, {
          message: 'Данные пользователя не найдены'
        });
      } else if (err) { // Check for error
        utils.sendJsonResponse(res, 400, err);
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
        }, []);
        // Filter by date
        let tasksFiltered = tasksArray.filter(t => utils.isToday(t.date));
        // Send them
        utils.sendMail(
          `Do Not Reply easylist <${process.env.VER_ADDRESS}>`,
          req.user.email,
          'Ваши задачи на сегодня',
          utils.formSurvey(tasksFiltered)
        ).then(info => {
          utils.sendJsonResponse(res, 200, {
            message: 'Отправлено успешно'
          });
        }).catch(err => {
          utils.sendJsonResponse(res, 400, err);
        });
      }
    });
};
