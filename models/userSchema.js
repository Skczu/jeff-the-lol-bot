const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userID: {type: String, required: true},
  region: { type: String, required: true },
  sumName: { type: String, required: true },
  sumID: { type: String, required: true }
});

const Model = mongoose.model("User", userSchema);

module.exports = Model;