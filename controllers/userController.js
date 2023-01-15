const Post = require("../models/Post")
const User = require("../models/User")
const { error, success } = require("../utils/responseWrapper")
const cloudinary = require('cloudinary').v2
const { mapPostOutput } = require("../utils/Utils")
const dotenv = require('dotenv')
dotenv.config({path:'./.env'})

const followOrUnfollowUser = async (req,res) =>{

    try {

        const {userIdToFollow} = req.body
        const currentUserId = req._id



        const currentUser = await User.findById(currentUserId)
        const userToFollow = await User.findById(userIdToFollow)

        if(!userToFollow)
        {
            return res.send(error(404,'User To Follow Not Found'))
        }

        if(userIdToFollow === currentUserId){
            return res.send(error(409,'User not follow himself '))
        }

        if(currentUser.followings.includes(userIdToFollow)){
            // already followed
            const followingIndex = currentUser.followings.indexOf(userIdToFollow)
            currentUser.followings.splice(followingIndex,1)


            const followerIndex = userToFollow.followers.indexOf(currentUserId)
            userToFollow.followers.splice(followerIndex,1)

            await userToFollow.save()
            await currentUser.save()

            // return res.send(success(200,'User unFollowed'))
        }
        else{
            // now following
            userToFollow.followers.push(currentUserId)
            currentUser.followings.push(userIdToFollow)

            await userToFollow.save()
            await currentUser.save()

            // return res.send(success(200,'User Followed'))
            
        }
        return res.send(success(200,{user:userToFollow}))

        
    } catch (e) {
        return res.send(error(500,e.message))
    }


}

const  getFeedData = async (req,res) => {

    try {
        const currUserId = req._id

        const currUser = await User.findById(currUserId).populate('followings')

        // 1 ) Following posts 
        const fullPosts = await Post.find({
            'owner':{
                '$in':currUser.followings
            }
        }).populate('owner')

        
        const posts = fullPosts.map(item=>mapPostOutput(item,req._id)).reverse()


        // suggestions

        const followingsIds = currUser.followings.map(item => item._id)

        followingsIds.push(currUserId)
        const suggestions = await User.find({    //not Followings Users
            _id:{
                '$nin':followingsIds
            }
        })

        return res.send(success(200,{...currUser._doc,suggestions,posts}))
        
    } catch (error) {
        return res.send(error(500,e.message))
    }

}

const getMyPosts = async (req,res) => {

    try {

        const currentUserId = req._id

        const allUserPosts = await  Post.find({
            owner:currentUserId
        }).populate('likes')

        return res.send(success(200,allUserPosts))

        
    } catch (e) {
        return res.send(error(500,e.message))
    }

}

const getUserPosts = async (req,res) => {
    try {

        const {userId} = req.body

        // user hai bhi nhii ya
        const user = await User.findById(userId)

        if(!user){
            return res.send(error(404,'User is not found'))
        }

        if(!userId){
            return res.send(error(400,'userId is required'))
        }
        const userPosts = await  Post.find({
            owner:userId 
        }).populate('likes')

        

        return res.send(success(200,userPosts))

        
    } catch (e) {
        return res.send(error(500,e.message))
    }
}

const deleteMyProfile = async (req,res) => {

   try {

        const currentUserid = req._id

        const currentUser = await User.findById(currentUserid)

        // delete all posts
        await Post.deleteMany({
            owner:currentUserid
        })

        // jo log es user ko follow ker rhee the unkee following me se esse delete kernee padegaa
        // remove my self from follower followings

        currentUser.followers.forEach(async followerId => {
            const follower = await User.findById(followerId)

            const index = follower.followings.indexOf(currentUserid)

            follower.followings.splice(index,1)
            
            await follower.save()

        })

        // user jinkoo follow kertaa hai unkee followers me se bhi htaa dengee
        // remove myself from my followings followers

        currentUser.followings.forEach(async FollowingId => {

            const following = await User.findById(FollowingId)

            const index = following.followers.indexOf(currentUserid)

            following.followers.splice(index,1)

            await following.save()
        })


        // remove myself from all likes (heavy operation)
        // saarii ki saari post me jaaygenee and delete like ke array me my Id

        const allPosts = await Post.find()
        allPosts.forEach (async post => {

            const index = post.likes.indexOf(currentUserid)

            post.likes.splice(index,1)

            await post.save()
        })

        //  delete my self
        await currentUser.remove()

        // also delete cookies
        res.clearCookie('jwt',{
            httpOnly:true,
            secure:true,
        })

        return res.send(success(200,'User Deleted Succefully '))
    
    } catch (e) {
            return res.send(error(500,e.message))
    }
}

const getMyInfo = async (req,res) => {
    try {

        const currentUserId = req._id
        
        const user = await User.findById(currentUserId)

        return res.send(success(200,{user}))

    } catch (e) {
        return res.send(error(500,e.message))
    }
}

const getUserProfile = async (req,res) =>{
     
    try {

        const userId = req.body.userId

        const user = await User.findById(userId).populate({
            path:'posts',
            populate:{
                path:'owner'
            }
        })

        const fullPosts = user.posts

        const posts = fullPosts.map(item=>mapPostOutput(item,req._id)).reverse()

        return res.send(success(200,{...user._doc,posts}))

        
    } catch (e) {
        return res.send(error(500,e.message))
    }

}

const updateUserProfile = async (req,res) => {

    try {

        const {name,bio,userImage} = req.body
            
        // to save a image we are going to use cloudinary

        const currentUserId = req._id

        const user = await User.findById(currentUserId)
        
        if(name){
            user.name = name
        }
        if(bio){
            user.bio = bio
        }
        if(userImage){


            // image uploade at cloudinary
            const cloudImg = await cloudinary.uploader.upload(userImage, {
                folder: 'profileImg',
                api_key:process.env.CLOUDINARY_API_KEY
            })

            
            user.avatar = {
                url:cloudImg.secure_url,
                publicId:cloudImg.public_id
            }

        }
        await user.save()

      

        return res.send(success(200,{user}))
        
    } catch (e) {
        return res.send(error(500,e.message))
    }

}
module.exports = {
    followOrUnfollowUser,
    getFeedData,
    getMyPosts,
    getUserPosts,
    deleteMyProfile,
    getMyInfo,
    updateUserProfile,
    getUserProfile,

    // getMyPosts -> current user posts
    // deleteMyProfile -> delete himself and delete from all where he follow (from followers part of users) and (following part of others) where he like all cokkie bhi dleete & logout
    // getUserPost -> particuler user post
    // getMyPost - > get ourslef post

}