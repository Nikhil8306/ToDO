const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')

// Collections
const User = require('../models/userColl')

dotenv.config()

async function verify(req, res, next){
    // console.log(req.headers)
    try{
        if (jwt.verify(req.headers.auth_token, process.env.SECRET_TOKEN_KEY)){
            const userName = jwt.decode(req.headers.auth_token).username;
            const currUser = await User.findOne({userName: userName}) 
            
            if (currUser){
                return next()
            }
        }
    }
    catch(err){
        return res.status(401).json({mssg:"Unauthorized"})
    }

    res.status(401).json({mssg:"Unauthorized"})
} 

module.exports = verify
// Functions
