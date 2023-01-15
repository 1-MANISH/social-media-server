// all dependencies 
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const cloudinary = require('cloudinary').v2

//  database connection
const dbConnect = require('./dbConnect')

// routes define
const authRouter = require('./routers/authRouter')
const postsRouter = require('./routers/postsRouter')
const userRouter = require('./routers/userRouter')


// cloudinary configration - for image storage
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:  process.env.CLOUDINARY_API_SECRET_KEY
});


dotenv.config({path:'./.env'})
const app = express()

// middlewares
app.use(express.json({limit:'100mb'})) // to pass json  ton body
app.use(morgan('Common')) // konsii api call kerii hai
app.use(cookieParser()) // for cookies
app.use(cors({ // for cors (cors origin resourse sharing)-> frontend & backend on different ip
    credentials:true,
    origin:'http://localhost:3000'
}))


// routers
app.use('/auth',authRouter)
app.use('/posts',postsRouter);
app.use('/user',userRouter)


// check apit
app.get('/',(req,res)=>{
    res.status(200).send('Working Server')
})


// getting port number from 
const PORT = process.env.PORT || 4001

dbConnect()

// listening on PORT
app.listen(PORT,()=>{
    console.log(`Listening on Port : ${PORT}`)
})

