const mongoose = require('mongoose');


const Userdata = mongoose.model('Userdata');

module.exports.getVirtues = (req, res, next) => {
  // Find and return user's virtues
  Userdata
    .findById(req.user.data_id)
    .exec((err, userdata) => {
      if (!userdata) { // Check if userdata is found
        sendJsonResponse(res, 404, {
          message: 'Userdata not found'
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
    return res.status(400).end('Please enter all fields');
  } else { // Find user's data and add a virtue
    Userdata
      .findById(req.user.data_id)
      .exec((err, userdata) => {
        if (!userdata) { // Check if userdata is found
          sendJsonResponse(res, 404, {
            message: 'Userdata not found'
          });
        } else if (err) { // Check for error
          sendJsonResponse(res, 400, err);
        } else { // Add virtue and save the userdata
          const newVirtue = { name };
          const exists = userdata.virtues.findIndex(el => el.name === name);
          if (exists !== -1) { // Check if the such virtue already exists
            sendJsonResponse(res, 400, {
              message: 'Virtue already exists'
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
  const { name, task, date } = req.body;
  if (!name) {   // Check if all data is present
    sendJsonResponse(res, 400, {
      message: 'Please provide name'
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
          message: 'Userdata not found'
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
  const { text } = req.body;
  if (!text) { // Check if all data is present
    sendJsonResponse(res, 400, {
      message: 'Please provide task text'
    });
  } else { // Create the task and send it back
    req.userdata.virtues[req.virtue_index].tasks.push({ text });
    req.userdata.save()
      .then(savedData => {
        const currentVirtue = savedData.virtues[req.virtue_index]
        const lastIndex = currentVirtue.tasks.length - 1;
        sendJsonResponse(res, 201, {
          id: currentVirtue.tasks[lastIndex].id,
          data: currentVirtue.tasks[lastIndex].date,
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
      message: 'Task not found'
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


// Some useful functions

// Ends res with given status and json content
function sendJsonResponse(res, status, content) {
  res.status(status).json(content);
}
