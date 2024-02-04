const router = require('express').Router()
const jwt = require('jsonwebtoken')
const zod = require('zod')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

const bcrypt = require("bcrypt")
const saltRound = 5


router.use(require('express').static('public'))
router.use(cookieParser())

dotenv.config()

// zod schemas
const mailSchema = zod.string().email()

// Models
const users = require('../models/userColl.js')

// middleware to check if logged in
router.use(checkToken)

// Login route
router.route('/login')
.get(function(req, res){
    res.render("login")
})
.post(async function(req, res){
    
    const {username, password} = req.body;
    let currUser = null
    // console.log(username)
    if (mailSchema.safeParse(username).success === true){
        currUser = await users.findOne({mail:username});
        if (!currUser){
            return res.status(401).json({mail_err:'No such mail registered'})
        }   
    }

    else{
        currUser = await users.findOne({userName:username});
        if (!currUser){
            res.status(401).json({username_err:'No such username found'})
            return;
        }
    }

    const match = await bcrypt.compare(password, currUser.password)
    if (!match){
        return res.status(401).json({password_err:'Password does not match'})
    }

    res.cookie("auth_token", createToken(currUser.userName))
    res.redirect("/board")
})


// Register route
router.route('/register')
.get(function(req, res){
    res.render("register")
})
.post( async function(req, res){
    const {mail, firstName, lastName, username, password} = req.body;
    if (!mailSchema.safeParse(mail).success){
        return res.json({mail_err:"Invalid email address"})
    }
    if (await users.findOne({mail:mail})) return res.json({mail_err:"Mail already registered"})
    if (await users.findOne({userName:username})) return res.json({username_err:"Username already taken"})

    const hashed = await bcrypt.hash(password, saltRound);
    await new users({
        firstName:firstName,
        lastName:lastName,
        userName:username,
        mail:mail,
        password:hashed
    }).save()

    res.cookie("auth_token", createToken(username))
    res.redirect("/board")
})

// functions
async function checkToken(req, res, next){
    try{
        const token = req.cookies.auth_token;
        if (jwt.verify(token, process.env.SECRET_TOKEN_KEY)){
            const username = jwt.decode(token).username;
            if (await users.findOne({userName: username})){
                return res.redirect('/board')
            }
        }
    }
    catch(err){
        console.log("File: auth.js, error in checkToken function")
    }
    next()
}

function createToken(username){
    return jwt.sign({username:username}, process.env.SECRET_TOKEN_KEY)
}

// Exports
module.exports = router