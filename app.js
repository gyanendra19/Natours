const express = require('express');
const path = require('path')
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const reviewRouter = require('./routes/reviewRoutes.js');
const appError = require('./utils/appError.js');
const errorGlobalMiddleware = require('./controllers/errorController.js')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize')
const cookieParser = require('cookie-parser')
const xss = require('xss-clean')
const hpp = require('hpp')
const viewRouter = require('./routes/viewRoutes.js')

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))

app.use(helmet({ contentSecurityPolicy: false }));

// console.log(process.env.NODE_ENV)
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests. Please try in an hour'
})
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser())

app.use(mongoSanitize());
app.use(xss());
app.use(hpp({
    whitelist: ['duration', 'price', 'difficulty', 'ratingAverage']
}))

app.use('/api', limiter);


app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.cookies)
    next()
})


app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/', viewRouter)
app.use('/bookings', bookingRouter)


app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `can't find ${req.originalUrl}`
    // })

    // const err = new Error( `can't find ${req.originalUrl}`);
    // err.statusCode = 404;
    // err.status = 'fail';


    next(new appError(`can't find ${req.originalUrl}`, 500))
})


app.use(errorGlobalMiddleware)
// app.get('/api/v1/tours/:id', getTour)
// app.get('/api/v1/tours', getAllTours)
// app.post('/api/v1/tours', setTours)
// app.patch('/api/v1/tours/:id' , updateTour)

module.exports = app;



