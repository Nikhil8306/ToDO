const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/ToDo')

const commSchema = mongoose.Schema({
    communityName:{
        type:String
    },
    membersId:[{
        type:mongoose.ObjectId,
        ref:'users'
    }],
    adminId:mongoose.Schema.ObjectId,
    description:String,
    startDate:{
        type:Date,
        default:Date.now
    },
    endDate:{
        type:Date
    }
})

module.exports = mongoose.model('communities', commSchema)