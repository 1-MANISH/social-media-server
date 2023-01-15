const requireUser = require('../middlewares/requireUser')
const userController = require('./../controllers/userController')
const router = require('express').Router()


router.post('/follow',requireUser,userController.followOrUnfollowUser)
router.get('/getFeedData',requireUser,userController.getFeedData)
router.get('/getMyPosts',requireUser,userController.getMyPosts)
router.post('/getUserPosts',requireUser,userController.getUserPosts)
router.delete('/deleteMyProfile',requireUser,userController.deleteMyProfile)
router.get('/getMyInfo',requireUser,userController.getMyInfo)

router.put('/updateMyProfile',requireUser,userController.updateUserProfile)
router.post('/getUserProfile',requireUser,userController.getUserProfile)
module.exports = router