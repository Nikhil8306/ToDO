const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/ToDo')

const getCommSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.ObjectId
    },
    communitiesId:[{
        type:mongoose.Schema.ObjectId,
        ref:'communities'
    }],
})

module.exports = mongoose.model('getCommunities', getCommSchema)