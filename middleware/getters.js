const mongoose = require('mongoose');


const User = mongoose.model('User');
const Userdata = mongoose.model('Userdata');

// A bunch of getters to unclutter the main controllers

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

// Finds the virtue from req.user and req.params.virtueName and sets the
// corresponding req.userdata and req.virtue_index
module.exports.getVirtueByName = (req, res, next) => {
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
        const index = userdata.virtues.findIndex(el => el.name === req.params.virtueName);
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
