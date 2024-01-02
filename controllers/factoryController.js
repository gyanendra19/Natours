const appError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIfeatures = require('./../utils/APIFeatures.js')


exports.deleteOne = Model => catchAsync(async (req, res, next) => {

    let doc = await Model.findByIdAndDelete(req.params.id)

    if(!doc){
        return next(new appError('No document found with this id', 404));
    }

    res.status(204).json({
        status: "succes",
        data: null
    })
})

exports.updateOne = Model => catchAsync(async (req, res, next) => {

    let doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if(!doc){
        return next(new appError('No document found with this id', 404));
    }

    res.status(200).json({
        status: "succes",
        data: {
            data: doc
        }
    })
})

exports.createOne = Model => catchAsync(async (req, res) => {
   
    const doc = await Model.create(req.body);

    res.status(201).json({
        status: "success",
        data: {
            data: doc
        }
    })
})

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
       
    const query =  Model.findById(req.params.id)
    if(popOptions) query.populate(popOptions)
    const doc = await query;

    if(!doc){
        return next(new appError('No document found with this id', 404));
    }

    res.status(200).json({
        status: "success",
        time: req.requestTime,
        data: {
            data: doc
        }
    })
})

exports.getAll = Model => catchAsync(async (req, res) => {
    console.log('say hiiii')
    let filter = {};
    if(req.params.tourId) filter = { tour: req.params.tourId };

    let features = new APIfeatures(Model.find(filter), req.query).filter().paginate().sort()
    .limit();

    const doc = await features.query;
    res.status(200).send({
        status: "success",
        result: doc.length,
        data: {
            data: doc
        }
    })
})