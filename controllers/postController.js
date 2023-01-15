
const Post = require('../models/Post');
const User = require('../models/User');
const {success, error} =  require('./../utils/responseWrapper')
const cloudinary = require('cloudinary').v2
const {mapPostOutput} = require('./../utils/Utils')

const dotenv = require('dotenv')
dotenv.config({path:'./.env'})


const createPostController = async (req,res) =>{

    try {
        
        const {caption,postImage} = req.body // from body
        const owner = req._id // come from middleware (requireuser)

        if(!caption){
            return res.send(error(500,'caption is required to create a post'))
        }
        if(!postImage){
            return res.send(error(500,'Post Image is required to create a post'))
        }


        // post image gyiii in cloudinary
        const cloudImage = await cloudinary.uploader.upload(postImage,{
            folder:'postImg'
        })


        //find that image
        const user = await User.findById(req._id)

        const post = await Post.create({
            owner,
            caption,
            image:{
                publicId:cloudImage.public_id,
                url:cloudImage.secure_url,
            }
        })

        user.posts.push(post._id)

        await user.save()

        return res.send(success(201,{post}))

        
    } catch (e) {
        res.send(error(500,e.message))
    }



}

const likeAndUnlikePostController = async (req,res)=>{

    try {
        const {postId} = req.body
        const currentUserId = req._id


        const post = await Post.findById(postId).populate('owner')

        if(!post){
            return res.send(error(404,'Post Not found'))
        }

        if(post.likes.includes(currentUserId)){

            const index = post.likes.indexOf(currentUserId)

            post.likes.splice(index,1)

            // unliked
            
        }
        else{
            post.likes.push(currentUserId)
            //liked
        }

        await post.save()

        return res.send(success(200,{post:mapPostOutput(post,currentUserId)}))

        
    } catch (e) {
        return res.send(error(500,e.message))
    }


}

const updatePostController = async (req,res) => {

    try {
        const {caption,postId} = req.body
        const currentUserId = req._id

        const post = await Post.findById(postId)

        if(!post){
            return res.send(error(404,'Post Not Found'))
        }

        if(post.owner.toString() !== currentUserId){
            return res.send(error(403,'Only owener can update post'))
        }

        if(caption){
            post.caption = caption
            
        }

        await post.save()

        return res.send(success(200,post))

        
    } catch (e) {
        return res.send(error(500,e.message))
    }

}

const deletePostController = async (req,res) => {

    try {
        const {postId} = req.body
        const currentUserId = req._id

        const post = await Post.findById(postId)
        const currentUser  = await User.findById(currentUserId)

        if(!post){
            return res.send(error(404,'Post Not Found'))
        }

        if(post.owner.toString() !== currentUserId){
            return res.send(error(403,'Only owener can Delete post'))
        }

        const index = currentUser.posts.indexOf(postId)

        currentUser.posts.splice(index,1)

        await currentUser.save()

        await post.remove()

        return res.send(success(200,'Post deleted Succefully'))

        
    } catch (e) {
        return res.send(error(500,e.message))
    }

}

module.exports = {
    createPostController,
    likeAndUnlikePostController,
    updatePostController,
    deletePostController,
}