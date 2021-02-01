const mongoose = require('mongoose');


const Userdata = mongoose.model('Userdata');
const User = mongoose.model('User');

module.exports.getVirtues = (req, res, next) => {
  User.findById(req.user.id)
    .then(user => {
      // Check if user exists
      if (!user) {
        res.status(400).end('User does not exist');
      }

      // Find and return user's virtues
      Userdata.findById(user.data_id)
        .then(userdata => {
          res.json(userdata.virtues);
        });
    });
}

module.exports.addVirtue = (req, res, next) => {
  const { name, task } = req.body;

  // Check if all data is present
  if (!name || !task) {
    res.status(400).end('Please enter all fields');
  } else {
    // Find the user
    User.findById(req.user.id)
      .then(user => {
        // Check if user exists
        if (!user) {
          res.status(400).end('User does not exist');
        } else {
          // Find user's data and add a virtue
          Userdata.findById(user.data_id)
            .then(userdata => {
              const newVirtue = { name, task }
              userdata.virtues.push(newVirtue);
              userdata.save()
                .then(createdUserdata => {
                  res.status(201).json(
                    createdUserdata.virtues[createdUserdata.virtues.length - 1]
                  );
                });
            });
        }
      });
  }
}

module.exports.updateVirtue = (req, res, next) => {
  res.end('Update virtue');
}

module.exports.deleteVirtue = (req, res, next) => {
 res.end('Delete virtue');
}
