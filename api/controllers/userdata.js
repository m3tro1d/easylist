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
  res.end('Add virtue');
}

module.exports.updateVirtue = (req, res, next) => {
  res.end('Update virtue');
}

module.exports.deleteVirtue = (req, res, next) => {
 res.end('Delete virtue');
}
