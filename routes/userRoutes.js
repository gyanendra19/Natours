const express = require('express');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');


const router = express.Router();

//SIGNUP
router.post('/signup', authController.signUp);

//LOGIN
router.post('/login', authController.logIn);

//LOGOUT
router.get('/logout', authController.logout);

//FORGOT PASSWORD
router.post('/forgotPassword', authController.forgotPassword);

// RESET PASSWORD
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect)

// UPDATE PASSWORD
router.patch('/updateMyPassword', authController.updateMyPassword);

//update data
router.patch('/updateMe', userController.uploadUserPhoto,userController.resizeUserPhoto, userController.updateMe);

//Get user
router.get('/me', userController.getMe, userController.getUser);


//DELETE USER
router.delete('/deleteMe', userController.deleteMe)

router.use(authController.restrictTo('admin'))

//IDS
router.route('/:id').get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser);

// WITHOUT IDS
router.route('/').get(userController.getAllUsers);

module.exports = router;