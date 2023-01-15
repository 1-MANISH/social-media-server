const mongoose = require('mongoose')

// creating userSchema 
const userSchema = mongoose.Schema({

    email:{
        type:String,
        require:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        require:true,
        select:false, // yeah ab nhii dikhega in schema jb value send ker rhee hote hai (use selete('+field_name'))
    },
    name:{
        type:String,
        require:true,
    },
    bio: {
        type: String,
    },
    avatar:{
        publicId:String,
        url:String,
    },
    followers: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
    ],
    followings:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
    ],
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'post'   
        }
    ]
},{
    timestamps:true
})

module.exports = mongoose.model('user',userSchema)


