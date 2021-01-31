const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  registration_date: {
    type: Date,
    'default': Date.now
  }
});

mongoose.model('User', userSchema);