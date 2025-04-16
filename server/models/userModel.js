const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  githubId: String,
  username: String,
  displayName: String,
  profileUrl: String,
  photos: Array,
  email: String,
  created: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;