const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isVegetarian: {
    type: Boolean,
    'default': false
  },
  data_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Userdata',
    required: true
  }
});

mongoose.model('User', userSchema);
