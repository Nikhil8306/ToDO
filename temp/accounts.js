const express = require('express')
const zod = require('zod')
const route = express.Router()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const users = require('../models/userColl')

const bcrypt = require('bcrypt')
const saltRound = 1;

const mailSchema = zod.string().email();

const secureKey = 'Nikhil123@456$789%'

route.use(cookieParser())
route.use(express.static("public"))
route.use(async function(req, res, next){
    try{
        if (jwt.verify(req.cookies.id, secureKey)){
            const userData = jwt.decode(req.cookies.id)
            if (await users.findOne({username:userData.username, mail:userData.mail})){
                res.redirect('board')
            }
        }
    }
    catch(err){
        console.log(err)
    }
    next();
})

route.get('/login', function(req, res){
    res.render('login', {mail_error:"", pass_error:""})
})

route.post('/login', async function(req, res){
    if (mailSchema.safeParse(req.body.username).success){
        if (!await users.findOne({mail:req.body.username})){
            res.render('login', {mail_error:"No such mail registered", pass_error:""})
        }
        
        else{
            const result = await bcrypt.compare(req.body.password, (await users.findOne({mail:req.body.username})).password);
            
            if (result){
                const currUser = await users.findOne({mail:req.body.username});
                const token = jwt.sign({username:currUser.username, mail:currUser.mail}, secureKey)
                res.cookie("id", token)   
                res.redirect('../board')
            }
            else{
                res.render('login', {mail_error:"", pass_error:"Password does not match"})
            }  
        }   
    }
    else{
        if (!await users.findOne({"username":req.body.username})){
            res.render('login', {mail_error:'No such username registered', pass_error:""})
        }
        else {
            const currUser = await users.findOne({username:req.body.username});

            const token = jwt.sign({username:currUser.username, mail:currUser.mail}, secureKey)
            res.cookie("id", token)
            res.redirect('../board')
        }
    }
})


route.get('/register', function(req, res){
    res.render("register", {mail_error:"", name_error:"", pass_error:""})
})

route.post('/register', async function(req, res){
    const username = req.body.username;
    const mail = req.body.mail;
    const password = req.body.password;
    
    const passHash = await bcrypt.hash(password, saltRound);
    mailerr=''
    nameerr=''

    if (await users.findOne({username:username})){
        nameerr = 'Username already taken'
    }
    if (await users.findOne({mail:mail})){
        mailerr = 'This mail is already in use'
    }

    if (mailerr === '' && nameerr === ''){
        const newUser = new users({
            username:username,
            mail:mail,
            password:passHash
        })
        await newUser.save()
        const currUser = await users.findOne({mail:req.body.mail});
        const token = jwt.sign({username:currUser.username, mail:currUser.mail}, secureKey)
        res.cookie("id", token)
        res.redirect("../board")
    }

    else res.render('register', {mail_error:mailerr, name_error:nameerr, pass_error:''})
})

module.exports = route
