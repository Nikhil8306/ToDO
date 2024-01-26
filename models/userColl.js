const mongoDB = require("mongoose");

mongoDB.connect('mongodb://127.0.0.1:27017/ToDo')

const userSchema = mongoDB.Schema({
    userName:String,
    mail:String,
    password:String,
    firstName:String,
    lastName:String,
    age:Number,
    occupation:String
})

const userModel = mongoDB.model("users", userSchema);

module.exports = userModel
