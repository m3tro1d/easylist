const mongoose = require('mongoose');

const userdataSchema = mongoose.Schema({
  virtues: [{
    task: {
      type: String,
      'default': ''
    },
    date: {
      type: Date,
      'default': Date.now()
    }
  }]
});

mongoose.model('Userdata', userdataSchema, 'userdata');
