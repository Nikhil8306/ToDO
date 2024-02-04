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
    let UID = currUser._id
    // console.log(req.headers.auth_token, req.headers.workarea)
    try{
        if (req.headers.workarea == 'Personal'){
            return res.status(200).json(await Task.find({userId:currUser._id, workArea:'Personal'}))
        }
        else{
            if (req.headers.userid != "") {
                UID = req.headers.userid
            }
            
            return res.status(200).json(await Task.find({userId:UID, workspaceId:req.headers.workspaceid}))
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
        const currWorkspace = await Workspace.findOne({_id:workspaceId});

        if (String(currWorkspace.adminId) != String(currUser._id)) return res.status(401).json({mssg:"cannot add task"})
        userId = req.body.userId;
        if (req.body.userId == '') userId = currUser._id
    }
    try{
        await new Task({
            title: taskBody.title,
            description:taskBody.description,
            workArea:workArea,
            workspaceId:workspaceId,
            userId:userId,
            isImportant:taskBody.isImportant,
            repeatDaily:taskBody.repeatDaily,
            dueDate:taskBody.dueDate,
            dueTime:taskBody.dueTime,
            isCompleted:false
        }).save()
    }
    catch(err){
        console.log(err)
        return res.status(400).json({mssg:"Didn't saved the data"})
    }
    
    res.status(200).json({"msg":"Success"})
})
.patch(async function(req, res){
    try{
        const taskId = req.body.taskId

        await Task.findOneAndUpdate({_id:taskId},
            {
                title:req.body.title,
                description:req.body.description,
                dueTime:req.body.dueTime,
                isImportant:req.body.isImportant,
                repeatDaily:req.body.repeatDaily,
                isCompleted:req.body.isCompleted
            })

        res.status(200).json({mssg:"Success"})

    }
    catch(err){
        console.log(err)
        res.status(400).json({msg:"Cannot update"})
    }
})
.delete(async function(req, res){
    try{
        const taskId = req.body.taskId

        await Task.deleteOne({_id:taskId})

        res.status(200).json({mssg:"Success"})

    }
    catch(err){
        console.log(err)
        res.status(400).json({mssg:"Cannot delete"})
    }
})


// Workspaces
router.route('/workspaces')
.get(async function(req, res){
    try{
        const currUser = await User.findOne({userName:jwt.decode(req.headers.auth_token).username});
        const workspacesM = (await UserWorkRel.findOne({userId:currUser._id}))
        if (!workspacesM){
            return res.status(200).json({mss:"No Data"})
        }
        const workspaces = workspacesM.workspacesId
        const workData = []
        for(let i = 0; i < workspaces.length; i++){
            const currWorkspace = await Workspace.findOne({_id:workspaces[i]})

            if (currWorkspace){
                let admin = false;
                const membersMail = []
                const membersName = []
                const members = currWorkspace.membersId;
                // console.log(currWorkspace.workspaceName)
                for(let j = 0; j < members.length; j++){
                    let usr = await User.findOne({_id:members[j]})
                    if (!usr) continue
                    membersMail.push(usr.mail)
                    if (String(usr._id) == String(currUser._id)) {
                        membersName.unshift("You");
                        const mem = members.splice(j, 1)
                        members.unshift(mem);
                    }
                    else {
                        membersName.push(usr.firstName + " " + usr.lastName)
                    }
                    // console.log(usr)
                }

                
                if (String(currWorkspace.adminId) == String(currUser._id)) admin = true
                data = {
                    _id:workspaces[i],
                    name:currWorkspace.workspaceName,
                    admin:admin,
                    startDate:currWorkspace.startDate,
                    endDate:currWorkspace.endDate,
                    members:members,
                    membersMail:membersMail,
                    membersName:membersName
                }
                workData.push(data)
            }
            else{
                res.status(400).json({mssg:"No such workspace found"})
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
