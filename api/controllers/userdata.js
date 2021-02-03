const mongoose = require('mongoose');


const Userdata = mongoose.model('Userdata');
const User = mongoose.model('User');

module.exports.getVirtues = (req, res, next) => {
  User.findById(req.user.id)
    .then(user => {
      // Check if user exists
      if (!user) {
        return res.status(400).end('User does not exist');
      } else {
        // Find and return user's virtues
        Userdata.findById(user.data_id)
          .then(userdata => {
            return res.json(userdata.virtues);
          });
      }
    });
}

module.exports.addVirtue = (req, res, next) => {
  const { name, task } = req.body;

  // Check if all data is present
  if (!name || !task) {
    return res.status(400).end('Please enter all fields');
  } else {
    // Find the user
    User.findById(req.user.id)
      .then(user => {
        // Check if user exists
        if (!user) {
          return res.status(400).end('User does not exist');
        } else {
          // Find user's data and add a virtue
          Userdata.findById(user.data_id)
            .then(userdata => {
              const newVirtue = { name, task }
              userdata.virtues.push(newVirtue);
              userdata.save()
                .then(createdUserdata => {
                  return res.status(201).json(
                    createdUserdata.virtues[createdUserdata.virtues.length - 1]
                  );
                });
            });
        }
      });
  }
}

module.exports.updateVirtue = (req, res, next) => {
  // Update the virtue and save it
  req.userdata.virtues[req.virtue_index] = {
    name: req.body.name,
    task: req.body.task,
    date: req.body.date || Date.now()
  };
  req.userdata.save()
    .then(changedData => {
      return res.json(changedData.virtues[req.virtue_index]);
    });
}

module.exports.deleteVirtue = (req, res, next) => {
  // Remove the virtue and save the data
  const updatedVirtues = req.userdata.virtues.splice(req.virtue_index, 1);
  req.userdata.save()
    .then(changedData => {
      return res.status(204).end(null);
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

