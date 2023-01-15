
// middleware that : check that user has token or not And verfiy (logged in or not) : like Getkeeper

const jwt = require('jsonwebtoken')
const User = require('../models/User')
const {error} = require('./../utils/responseWrapper')

module.exports = async (req,res,next) => {

    // verification of access token

    if(!req.headers || 
       !req.headers.authorization ||
       !req.headers.authorization.startsWith('Bearer')
    ){
        return res.send(error(401,'Authorization header is required'))
    }   

    const accessToken = req.headers.authorization.split(" ")[1] // as ['Bearer',access_token]

    try {

        const decoded = jwt.verify(
            accessToken
            ,process.env.ACCESS_TOKEN_PIRVATE_KEY
        )
        
        req._id = decoded._id


        //  database call

        const user = await User.findById(req._id)

        if(!user){
            return res.send(error(404,'User Not Found'))
        }

        next()
        
    } catch (e) {
        return res.send(error(401,'Invalid Access Key'))

    }

}