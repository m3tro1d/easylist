const mongoose = require('mongoose');

const userdataSchema = mongoose.Schema({
  user_id: {
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
  }],
  virtues: [{
    name: {
      type: String,
      required: true
    }
  }]
});

mongoose.model('Userdata', userdataSchema);