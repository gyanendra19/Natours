const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync.js');
const User = require('./../models/userModel')
const multer = require('multer')
const sharp = require('sharp')
const factory = require('./factoryController.js')

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null , `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')){
        cb(null, true)
    }else{
        cb(new appError('Not an image, please upload only images', 400), false)
    }
}

const multerStorage = multer.memoryStorage()

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if(!req.file) return next()

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality: 90}).toFile(`public/img/users/${req.file.filename}`)

    next()
})


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el]
    })
    return newObj;
}


exports.getMe = (req, res , next) => {
     req.params.id = req.user.id;
     next()
}


exports.updateMe = catchAsync(async (req, res, next) => {
    if(req.body.password || req.body.confirmPassword){
       return next(new appError('This route is not for password updates.', 400))
    }

    const filterBody = filterObj(req.body, 'name', 'email');
    if(req.file) filterBody.photo = req.file.filename
    const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody , {
        new: true,
        runValidators: true
    })



    res.status(200).json({
        status: 'success',
        updateUser
    })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, {active: false});

    res.status(204).json({
        data: null
    })
})


exports.getUser = factory.getOne(User)
exports.updateUser = factory.updateOne(User)
exports.deleteUser  = factory.deleteOne(User)
exports.getAllUsers = factory.getAll(User)
