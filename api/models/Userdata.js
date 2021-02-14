const mongoose = require('mongoose');

const userdataSchema = mongoose.Schema({
  virtues: [{
    name: {
      type: String,
      required: true
    },
    tasks: [{
      text: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        'default': Date.now()
      }
    }]
  }]
});

mongoose.model('Userdata', userdataSchema, 'userdata');
