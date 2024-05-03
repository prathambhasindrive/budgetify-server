const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  imgUrl : { type: String },
  token: { type: String },
  resetPasswordExpiresIn: { type: Date }, 
});

const User = mongoose.model("User", userSchema);

module.exports = User;