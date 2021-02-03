const mongoose = require('mongoose');


const Userdata = mongoose.model('Userdata');
const User = mongoose.model('User');

module.exports.getVirtues = (req, res, next) => {
  // Find and return user's virtues
  Userdata
    .findById(req.user.data_id)
    .exec((err, userdata) => {
      if (!userdata) { // Check if userdata is found
        sendJsonResponse(res, 404, {
          message: 'Userdata not found'
        });
      } else { // Send the virtues
        sendJsonResponse(res, 200, userdata.virtues);
      }
    });
}

module.exports.addVirtue = (req, res, next) => {
  const { name, task } = req.body;
  if (!name || !task) { // Check if all data is present
    return res.status(400).end('Please enter all fields');
  } else { // Find user's data and add a virtue
    Userdata
      .findById(user.data_id)
      .exec((err, userdata) => {
        if (!userdata) { // Check if userdata is found
          sendJsonResponse(res, 404 {
            message: 'Userdata not found'
          });
        } else if (err) { // Check for error
          sendJsonResponse(res, 400, err);
        } else { // Add virtue and save the userdata
          const newVirtue = { name, task };
          userdata.virtues.push(newVirtue);
          userdata
            .save()
            .exec((err, changedData) => {
              if (err) { // Check for error
                sendJsonResponse(res, 400, err);
              } else { // Send the created virtue
                sendJsonResponse(res, 201,
                  changedData.virtues[changedData.virtues.length - 1]
                );
              }
            });
        }
      });
  }
}

module.exports.updateVirtue = (req, res, next) => {
  const { name, task, date } = req.body;
  if (!name || !task) {   // Check if all data is present
    sendJsonResponse(res, 400, {
      message: 'Please provide name and task'
    });
  } else {       // Update the virtue and save it
    req.userdata.virtues[req.virtue_index] = {
      name: name,
      task: task,
      date: date || Date.now()
    };
    req.userdata
      .save()
      .exec((err, savedData) => {
        if (err) { // Check for error
          sendJsonResponse(res, 400, err);
        } else { // Send the updated virtue
          sendJsonResponse(res, 200, savedData.virtues[req.virtue_index]);
        }
      });
  }
}

module.exports.deleteVirtue = (req, res, next) => {
  const updatedVirtues = req.userdata.virtues.splice(req.virtue_index, 1);
  req.userdata
    .save()
    .exec((err, savedData) => {
      if (err) { // Check for error
        sendJsonResponse(res, 400, err);
      } else { // Send the null response on successful deletion
        sendJsonResponse(res, 204, null);
      }
    });
}


// Userdata-specific middleware
// Finds the user from req.user.id and sets req.user
module.exports.getUserById = (req, res, next) => {
  User
    .findById(req.user.id)
    .exec((err, user) => {
      if (!user) { // Check if the user is found
        sendJsonResponse(res, 404, {
          message: 'User not found'
        });
      } else if (err) { // Check for error
        sendJsonResponse(res, 400, err);
      } else { // Pass to the next controller
        req.user = user;
        next();
      }
    });
}

// Finds the virtue from req.user and req.params.id and sets the
// corresponding req.userdata and req.virtue_index
module.exports.getVirtueById = (req, res, next) => {
  Userdata
    .findById(req.user.data_id)
    .exec((err, userdata) => {
      if (!userdata) { // Check if userdata is found
        sendJsonResponse(res, 404, {
          message: 'Userdata not found'
        });
      } else if (err) { // Check for error
        sendJsonResponse(res, 400, err);
      } else { // Pass to the next controller
        const index = userdata.virtues.findIndex(el => el.id === req.params.id);
        if (index === -1) { // Check if the virtue is present
          sendJsonResponse(res, 404, {
            message: 'Virtue not found'
          });
        } else { // Pass all the information
          req.virtue_index = index;
          req.userdata = userdata;
          next();
        }
      }
    });
}


// Some useful functions
// Ends res with given status and json content
function sendJsonResponse(res, status, content) {
  res.status(status).json(content);
}
