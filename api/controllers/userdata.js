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
      .findById(req.user.data_id)
      .exec((err, userdata) => {
        if (!userdata) { // Check if userdata is found
          sendJsonResponse(res, 404, {
            message: 'Userdata not found'
          });
        } else if (err) { // Check for error
          sendJsonResponse(res, 400, err);
        } else { // Add virtue and save the userdata
          const newVirtue = { name, task };
          userdata.virtues.push(newVirtue);
          userdata
            .save((err, changedData) => {
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
      .save((err, savedData) => {
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
    .save((err, savedData) => {
      if (err) { // Check for error
        sendJsonResponse(res, 400, err);
      } else { // Send the null response on successful deletion
        sendJsonResponse(res, 204, null);
      }
    });
}


// Some useful functions

// Ends res with given status and json content
function sendJsonResponse(res, status, content) {
  res.status(status).json(content);
}
