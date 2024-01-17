const mongoose = require("mongoose");

const users = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  lastName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  secret: {
    type: String,
    default: ""
  }
});

const sessionToken = new mongoose.Schema({
  accessToken: {
    type: Array,
    required: [true, "Token is required"],
    unique:true
  },
  refreshToken: {
    type: String,
    required: [true, "Refresh Token is required"],
    unique:true
  },
  blackListedToken: {
    type: Array,
    required: true,
  },
  username: {
    type: String,
    required: [true, "Username is required"]
  }
});

const secretNotes = new mongoose.Schema({
    secret: {
        type: String,
        required: "You have to give the secret Note"
    },
    userId: {
        type: String,
        required: "You have to give the userId as Well"
    }
})

module.exports = { users, sessionToken, secretNotes }