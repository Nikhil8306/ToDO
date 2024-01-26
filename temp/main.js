const route = require('express').Router()

route.get('/', function(req, res){
    res.render('main')
})

module.exports = route