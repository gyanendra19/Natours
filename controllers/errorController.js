const appError = require('../utils/appError')

const handleCastError = err => {
    const message = `Invalid${err.path}: ${err.value}`;
    return new appError(message, 400)
}

const handleValidationErr = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`
    return new appError(message, 400)
}

const handleDuplicateField = err => {
    const value = err.message.match(/(?<=(["']))(?:(?=(\\?))\2.)*?(?=\1)/)[0];
    const message = `Duplicate Field vale: ${value}. Please use another value`;

    return new appError(message, 400)
}

const handlerJWTError = () => {
    return new appError('Invalid Token. Try again later', 401)
}

const handleTokenExpire = () => {
    return new appError('Token Expired. Try again later', 401)
}

const sendErrorDev = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        })
    } else {
        res.status(err.statusCode).render('error', {
            title: 'something went wrong',
            msg: err.message
        })
    }
}

const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message,
            })
        }
    
    // console.log('ERROR 💥', err)
    return res.status(500).json({
        status: 'error',
        message: 'something went very wrong'
    })
}

    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong',
            msg: err.message
        })
    
    }

    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong',
        msg: 'Please try again!!'
    })

}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    console.log(process.env.NODE_ENV)
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res)
    } else if (process.env.NODE_ENV === 'production') {
        // let error = {...err};
        // console.log(error.name)
        if (err.name === 'CastError') err = handleCastError(err)
        if (err.name === 'ValidationError') err = handleValidationErr(err)
        if (err.code === 11000) err = handleDuplicateField(err)
        if (err.name === 'JsonWebTokenError') err = handlerJWTError()
        if (err.name === 'TokenExpiredError') err = handleTokenExpire()

        sendErrorProd(err, req, res)
    }
}