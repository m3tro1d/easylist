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

module.exports.getVirtueById = (req, res, next) => {
  // Find the user
  User.findById(req.user.id)
    .then(user => {
      if (!user) {
        return res.status(400).end('User does not exist');
      }
      // Find user's data
      Userdata.findById(user.data_id)
        .then(userdata => {
          // Find the needed virtue
          const index = userdata.virtues.findIndex(el => el.id === req.params.id);
          // Check if it exists
          if (index === -1) {
            return res.status(404).end('Virtue not found');
          }
          // Pass all the information to the next controller
          req.virtue_index = index;
          req.userdata = userdata;
          next();
        });
    });
}

module.exports.updateVirtue = (req, res, next) => {
  // Update the virtue and save it
  req.userdata.virtues[req.virtue_index] = {
    name: req.body.name,
    task: req.body.task,
    date: req.body.date
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
