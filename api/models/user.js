const { type } = require('@testing-library/user-event/dist/type');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    email:{type:String, required:true, unique:true},
    username: {type:String, required:true, min:4, unique:true},
    password:{type:String, required:true},
});

const UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;