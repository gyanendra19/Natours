const User = require('./../models/userModel.js');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const appError = require('./../utils/appError.js');
const Email = require('./../utils/email.js');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync.js')

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

const createToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires:  new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true 
    }

    user.password = undefined;
    res.cookie('jwt', token, cookieOptions)
    res.status(statusCode).json({
        status: 'success',
        token,
        data: user
    })
}


exports.signUp = catchAsync(async (req, res, next) => {
   
        console.log(req.body)
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword,
            role: req.body.role,
            photo: req.body.photo
        });

        const url = `${req.protocol}://${req.get('host')}/me`
        await new Email(newUser, url).sendWelcome();

        createToken(newUser, 201, res)
})

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    res.status(200).json({status: 'success'})
}

exports.logIn = catchAsync(async (req, res, next) => {
   
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new appError('please provide email and password', 500))
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.correctPassword(password, user.password))) {
            return next(new appError('incorrect email or password', 500))
        }

        createToken(user, 201, res)
   
})

exports.protect = catchAsync(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new appError('you are not logged in. Please login'), 401)
    }

    //VERIFICATION
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    console.log(decoded.id)
    if (!currentUser) {
        return next(new appError('The user belonging to this token does no longer exist', 401))
    }

    console.log((currentUser.changedPasswordAfter(decoded.iat)))
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new appError('Password changed. Login Again', 401))
    }


    req.user = currentUser
    res.locals.user = currentUser
    next()
})


exports.isLoggedin = async (req, res, next) => {
    if(req.cookies.jwt){
     try{

    //VERIFICATION
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next()
    }

    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next()
    }


    res.locals.user = currentUser
    return next()
    }catch(err){
        return next()
    }
}
    next()
}

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new appError('You are not allowed'), 403)
        }
        next()
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new appError('Ther is no user with this email', 404))
    }

    // 2) Generate the random reset Token
    const resetToken = user.createPasswordResetToken()
    await user.save({ validateBeforeSave: false })
    // console.log(user)

    // 3) send it to user's mail
    
    
    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL).resetPassword()

        res.status(200).json({
            status: 'success',
            message: 'Token send to email'
        })

    } catch (err) {
        user.passwordResetToken = undefined;
        user.tokenExpiresIn = undefined;
        await user.save({ validateBeforeSave: false })

        next(new appError('Error sending the email. Try later', 500));
        console.log(err)
    }

})

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, tokenExpiresIn: { $gt: Date.now() } });
    console.log(user)

    if (!user) {
        return next(new appError('Token is invalid or expired', 400))
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.tokenExpiresIn = undefined;
    await user.save();

    createToken(user, 200, res)
}
)

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  
        const user = await User.findById(req.user.id).select('+password')

        if (!user) {
            return next(new appError('No user exist', 404))
        }

        if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
            return next(new appError('Given password is wrong', 403))
        }

        user.password = req.body.password;
        user.confirmPassword = req.body.confirmPassword;
        console.log(user)
        await user.save();

        createToken(user, 200, res)

    
})