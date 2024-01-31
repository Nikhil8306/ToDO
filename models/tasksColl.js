const mongoDB = require("mongoose");

mongoDB.connect('mongodb://127.0.0.1:27017/ToDo')

const taskSchema = mongoDB.Schema({
    title:String,
    description:String,
    workArea:String,
    workspaceId:mongoDB.Schema.ObjectId,
    userId:mongoDB.Schema.ObjectId,
    dueTime:Date,
    isImportant:Boolean,
    repeatDaily:Boolean
})

const taskModel = mongoDB.model("tasks", taskSchema);

module.exports = taskModel
