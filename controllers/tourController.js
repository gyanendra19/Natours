const Tour = require('./../models/tourModel');
const multer = require('multer')
const sharp = require('sharp')
const catchAsync = require('../utils/catchAsync.js');
const factory = require('./factoryController.js');
const appError = require('./../utils/appError.js')

// exports.checkID = (req, res, next, val) => {
//     if(req.params.id > tours.length){
//         return  res.status(200).json({
//             status: "fail",
//             messgae: 'invalid ID'
//         })
//     }
//     next()
// }

// exports.checkBody = (req, res, next) => {
//     if(!req.body.name || !req.body.price){
//         return res.status(200).json({
//             status: "fail",
//             messgae: 'no price'
//         })
//     }

//     next()
// }

const multerFilter = (req, file, cb) => {
    // console.log(req.files)
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

exports.uploadTourPhoto = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
])

exports.resizeTourPhoto = catchAsync(async(req, res, next) => {

    if(!req.files.imageCover || !req.files.images) {
        return next()
    }

    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000,1333).toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/${req.body.imageCover}`)        
        
        req.body.images = [];
        
        await Promise.all(
         req.files.images.map((file, i) => {
            const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
            
            
            sharp(file.buffer)
            .resize(2000,1333).toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(`public/img/tours/${fileName}`)  
            
            req.body.images.push(fileName)
        })
)
        next()
    })

exports.aliasTopTour = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = 'price,ratingsAverage';
    req.query.fields = 'name, difficulty, summary, price, ratingAverage';
    next()
}

exports.getAllTours = factory.getAll(Tour)

exports.getTour = factory.getOne(Tour, { path: 'reviews' })
exports.createTours = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)

exports.tourStats = catchAsync(async (req, res) => {
        const stats = await Tour.aggregate([
            {
                $match: { ratingAverage: { $gte: 4.5 } }
            },
            {
                $group: {
                    _id: '$difficulty',
                    numRating: { $sum: '$ratingQuantity' },
                    numTour: { $sum: 1 },
                    avgRating: { $avg: '$ratingAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                }
            },
            {
                $sort: { avgPrice: 1 }
            }
        ])

        res.status(200).json({
            status: "succes",
            data: {
                stats
            }
        })
})

exports.monthlyPlan = catchAsync(async (req, res) => {

        year = req.params.year;

        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates:
                    {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    },
                }
            },
           {
            $group: {
                _id: { $month: '$startDates' },
                numToutStart: { $sum: 1 },
                tours: { $push: '$name'}
            }
           },
           {
            $addFields: { month: '$_id'} 
           },
           {
            $project: { _id: 0}
           }
        ])

        res.status(200).json({
            status: "succes",
            data: {
                plan
            }
        })
})

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    console.log(distance, lat, lng, unit)

    const radius = unit === 'mi' ? distance / 3963.2: distance / 6378.1;

    if(!lat || !lng){
        return new appError('Please provide latitude and longitude in the format lat,lng', 400)
    }

    const tours = await Tour.find({ startLocation : { $geoWithin: { $centerSphere: [[lng, lat], radius]}}})
    console.log(tours)

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            tours
        }

    })
})

exports.getDistances = catchAsync(async (req, res, next) => {
    const {latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    console.log(lat, lng, unit);

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if(!lat || !lng){
        return new appError('Please provide latitude and longitude in the format lat,lng', 400)
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier
            }
        },
            {
                $project: {
                    distance: 1,
                    name: 1 
                }
            }
        
    ])

    res.status(200).json({
        status: 'success',
        data: {
            distances
        }

    })
})