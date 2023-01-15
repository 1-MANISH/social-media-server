// dependecies
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// require files
const User = require('./../models/User')
const {error} = require('./../utils/responseWrapper')
const {success} = require('./../utils/responseWrapper')
// const { model } = require("mongoose")


const signupController = async (req,res) =>{

    try {

        const {name,email,password} = req.body // for this midleware (express.json() needed)

        if(!name || !email || !password){
                return res.send(error(400,'All fields are required'))
        }

        // validations -  certain criteria as u want

        // already logged in with this email (if user present or not)
        const oldUser = await User.findOne({email})
        if(oldUser){
                return res.send(error(409,'Already registerd with this email'))
        }

        // convert password to hash password using salt (number or key)
        const hashedPassword = await  bcrypt.hash(password,10)

        // save to database (with secure method)
        const user = await User.create({
            name,
            email,
            password:hashedPassword,

        })

        // send to browser
        return res.send(success(201,'User created successfully ! '))
        
    } catch (e) {

        res.send(error(500,e.message))
        console.log(e);

    }
}


const loginController = async (req,res) =>{

    try {

        const {email,password} = req.body // for this midleware (express.json() needed)

        if(!email || !password){
            return res.send(error(400,'All fields are required'))
        }


        // user has accound or not (Registered or Not )
        const user = await User.findOne({email}).select('+password')
        if(!user){
            return res.send(error(404,'User is not registered'))

        }

        // match  (that user & the passsword we get at login)

        const matched = await bcrypt.compare(password,user.password)

        if(!matched){
            return res.send(error(403,'Incorrect password'))
        }

        const accessToken = generateAccessToken(
            {
                _id:user._id,
            }
        )
        const refreshToken = generateRefreshToken(
            {
                _id:user._id,
            }
        )

        //SET COOKIES WITH REFRESH TOKEN (backend ne fronetend ko)
        
        res.cookie('jwt',refreshToken,{
            httpOnly:true,
            secure:true
        })

        // return res.json({accessToken})

        return res.send(success(200,{accessToken}))

        
    } catch (e) {
        res.send(error(500,e.message))
    }
}

// this api will check the refreshToken validity & generate new access token with same id (user)
const refreshAccessTokenController =  async (req,res)=>{


    const cookies = req.cookies // getting refresh token from cookies

    if(!cookies.jwt){ // if not present 
        return res.send(error(401,'Refresh Token in cookies is requires'))
    }

    const refreshToken = cookies.jwt // getting its value

    try {

        const decoded = jwt.verify( // verfiry it then it return id 
            refreshToken
            ,process.env.REFRESH_TOKEN_PIRVATE_KEY
        )
  

        const _id = decoded._id

        // creating new access token with same _id (user)
        const newAccessToken = generateAccessToken(
            {_id}
        )

        // return res.status(201).json({newAccessToken})

        return res.send(success(201,{newAccessToken}))

    } catch (e) {

        return res.send(error(401,'Invalid Refresh Token'))

    }

}

const logoutController = async (req,res) => {

    try {

        // from backend we can only delete cookies for that particuler user
        res.clearCookie('jwt',{
            httpOnly:true,
            secure:true
        })

        return res.send(success(200,'User Logout succefully !'))
        
    } catch (e) {

        res.send(error(500,e.message))
        
    }
}

// internal functions
const generateAccessToken = (data) =>{
    // data  &  secret key (always hidden) & expiresIn
    try {
        const token = jwt.sign(
            data,
            process.env.ACCESS_TOKEN_PIRVATE_KEY,
            {expiresIn:'15m'}
        )
        return token
        
    } catch (e) {
        console.log(e)
        // res.send(error(500,e.message))
    }
}

const generateRefreshToken = (data) =>{
    // data  &  secret key (always hidden) & expiresIn
    try {
        const token = jwt.sign(
            data,
            process.env.REFRESH_TOKEN_PIRVATE_KEY,
            {expiresIn:'1y'}
        )
        return token
        
    } catch (e) {
        console.log(e)
        // res.send(error(500,e.message))
    }
}


module.exports = {
    signupController,
    loginController,
    refreshAccessTokenController,
    logoutController,

}