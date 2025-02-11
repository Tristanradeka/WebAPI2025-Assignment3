const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    Username:{type:String, required:true, unique:true},
    Password:{type:String, required:true},
    Email:{type:String, required:true}
});

const User = mongoose.model("User", userSchema, "users");

module.exports = User