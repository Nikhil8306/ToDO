const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/ToDo')

const userWorkRel = mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId
    },
    workspacesId:[{
        type:mongoose.Schema.ObjectId,
        ref:'communities'
    }],
})

module.exports = mongoose.model('userWorkRel', userWorkRel)