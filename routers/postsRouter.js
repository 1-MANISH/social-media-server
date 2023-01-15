const router = require('express').Router()
const { model } = require('mongoose')

const postsController = require('./../controllers/postController')
const requireUser = require('./../middlewares/requireUser') // middle ware


router.post('/',requireUser,postsController.createPostController)

router.post('/like',requireUser,postsController.likeAndUnlikePostController)

router.put('/update',requireUser,postsController.updatePostController)

router.delete('/delete',requireUser,postsController.deletePostController)


module.exports = router