// Express
const express = require('express')
const app = express()
const port = 3000

// Routes
const authRoute = require('./routes/auth.js')
const boardRoute = require('./routes/board.js')

// View Engine
app.set('view engine', 'ejs')

// Static files
app.use(express.static('public'))
// middlewares
// middlware for urlencoded
app.use(express.urlencoded({extended:true}))
// middleware for json
app.use(express.json())

// Routes
app.use('/accounts', authRoute)
app.use('/board', boardRoute)

app.get('/board', function(req, res){
    res.render("board")
})

// listener
app.listen(port)
