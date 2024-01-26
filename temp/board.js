const express = require('express')
const route = express.Router()
const tasks = require('../models/tasksColl.js')
const secureKey = 'Nikhil123@456$789%'
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const users = require('../models/userColl.js')

route.use(cookieParser())
route.get('/', function(req, res){
    res.render('board')
})

route.post('/', function(req, res){
    res.render('board')
})

route.post('/task', async function(req, res){
    const token = req.cookies.id;
    userId = await users.findOne({username:jwt.decode(token).username})._id
    const {title, description, workarea} = req.body;
    const newTask = new tasks({
        title,
        description,
        workarea,
        userId
    })
    await newTask.save()
    res.send("saved successfully")
})
route.delete('/task', function(req, res){
    tasks.deleteOne({_id: req.taskId})
})

module.exports = route

