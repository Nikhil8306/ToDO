const router = require('express').Router()
const cookieParse = require('cookie-parser')
const jwt = require('jsonwebtoken')

// Middlewares
const verifyToken = require('../middlewares/verifyJWT.js')

// Collections
const User = require('../models/userColl.js')
const Task = require('../models/tasksColl.js')
const Workspace = require('../models/workspaceColl.js')

// Cookie parser
router.use(cookieParse())

router.get('/', checkToken, function(req, res){
    res.render('board')
})


router.use(verifyToken)

// Tasks
router.route('/tasks')
.get(async function(req, res){
    const currUser = await User.findOne({userName:jwt.decode(req.headers.auth_token).username});
    // console.log(req.headers.auth_token, req.headers.workarea)
    try{
        if (req.headers.workarea == 'Personal'){
            res.json(await Task.find({userId:currUser._id, workArea:'Personal'}))
        }
        else{
            res.json(await Task.find({userId:req.body.userId, workArea:req.body.workspaceId}))
        }
    }
    
    catch(err){
        res.status(500).json({"mssg":"Something is wrong"})
    }

})
.post(async function(req, res){
    // console.log(req.body)
    const currUser = await User.findOne({userName:jwt.decode(req.headers.auth_token).username});
    const taskBody = req.body;
    let workArea = 'Personal';
    let workspaceId = currUser._id
    let userId = currUser._id;
    if (req.headers.workarea != 'Personal'){
        workArea = 'Team';
        workspaceId = req.body.workspaceId;
        userId = req.body.userId;
    }
    try{
        await new Task({
            title: taskBody.title,
            description:taskBody.description,
            workArea:workArea,
            workspaceId:workspaceId,
            userId:userId,
            reminder:taskBody.reminder,
            startDate:taskBody.startDate,
            endDate:taskBody.endDate
        }).save()
    }
    catch(err){
        console.log(err)
        return res.status(400).json({mssg:"Didn't saved the data"})
    }
    
    res.status(200).json({"mssg":"Success"})
})



//functions

async function checkToken(req, res, next){
    try{
        const token = req.cookies.auth_token;
        if (jwt.verify(token, process.env.SECRET_TOKEN_KEY)){
            const username = jwt.decode(token).username;

            if (await User.findOne({userName: username})){
                
                return next()
            }
        }
    }
    catch(err){
        // console.log(err)
    }
    res.redirect('/accounts/login')
}

module.exports = router
