const router = require('express').Router()
const cookieParse = require('cookie-parser')
const jwt = require('jsonwebtoken')

// Middlewares
const verifyToken = require('../middlewares/verifyJWT.js')

// Collections
const User = require('../models/userColl.js')
const Task = require('../models/tasksColl.js')
const Workspace = require('../models/workspaceColl.js')
const UserWorkRel = require('../models/userWorkRelColl.js')


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
            return res.status(200).json(await Task.find({userId:currUser._id, workArea:'Personal'}))
        }
        else{
            return res.status(200).json(await Task.find({userId:req.body.userId, workArea:req.body.workspaceId}))
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


// Workspaces
router.route('/workspaces')
.get(async function(req, res){
    try{
        const currUser = await User.findOne({userName:jwt.decode(req.headers.auth_token).username});
        const workspaces = (await UserWorkRel.findOne({userId:currUser._id})).workspacesId

        const workData = []
        for(let i = 0; i < workspaces.length; i++){
            const currWorkspace = await Workspace.findOne({_id:workspaces[i]})

            if (currWorkspace){
                let admin = false;

                if (String(currWorkspace.adminId) == String(currUser._id)) admin = true
                data = {
                    name:currWorkspace.workspaceName,
                    admin:admin,
                    startDate:currWorkspace.startDate,
                    endDate:currWorkspace.endDate
                }
                workData.push(data)
            }

        }
        res.status(200).json(workData)
        
    }
    catch(err){
        console.log(err)
        res.status(400).json({"mssg":"Something went wrong"})
    }
})
.post(async function(req, res){
    try {
        const currUser = await User.findOne({userName:jwt.decode(req.headers.auth_token).username});
        const workspaceBody = req.body;
        const members = workspaceBody.memberId
        members.push(currUser.mail)
        const currMembers = []
        const memberIds = []
        for(let i = 0; i < members.length; i++){
            const user = await User.findOne({mail:members[i]});
            if (user){
                if (currMembers.includes(members[i])) continue
                memberIds.push(user._id)
                currMembers.push(members[i])
            }
        }
        const currWorkspace = await new Workspace({
            workspaceName:workspaceBody.workName,
            adminId:currUser._id,
            description:workspaceBody.description,
            startDate:workspaceBody.startDate,
            endDate:workspaceBody.endDate,
            membersId:memberIds
        }).save()

        for(let i = 0; i < memberIds.length; i++){
            const user = await UserWorkRel.findOne({userId:memberIds[i]})

            if (user){
                const workspaces = user.workspacesId
                workspaces.push(currWorkspace._id)

                await UserWorkRel.findOneAndUpdate({userId:memberIds[i]}, {workspacesId:workspaces})
            }
            else{
                const workspaces = [currWorkspace._id]
                await new UserWorkRel({
                    userId:memberIds[i],
                    workspacesId:workspaces
                }).save()
            }
        }
    }
    catch(err){
        console.log(err)
        res.status(400).json({mssg:"Something went wrong"})
        return
    }
    res.status(200).json({mssg:"success"})
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
