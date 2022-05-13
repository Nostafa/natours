const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
    catchAsync(async(req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);
        !doc
            ?
            next(new AppError(`No doc found with id ${req.params.id}`, 404)) :
            res.status(204).json({
                status: 'success',
                message: 'doc was deleted successful',
            });
    });

exports.updateOne = (Model) =>
    catchAsync(async(req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        !doc
            ?
            next(new AppError(`No document found with id ${req.params.id}`, 404)) :
            res.status(200).json({
                status: 'success',
                data: doc,
            });
    });

exports.createOne = (Model) =>
    catchAsync(async(req, res, next) => {
        const doc = await Model.create(req.body);
        res.status(201).json({
            status: 'success',
            doc,
        });
    });

exports.getAll = (Model) =>
    catchAsync(async(req, res, next) => {
        //! to allow for nested GET reviews on Tour (hack)
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };

        // ?Execute Query
        const features = new ApiFeatures(Model.find(filter), req.query)
            .filtering()
            .sorting()
            .fieldLimiting()
            .pagination();
        const doc = await features.query;

        //*Send Response
        res.status(200).json({
            status: 'success',
            result: doc.length,
            data: doc,
        });
    });

exports.getOne = (Model, populateOption) =>
    catchAsync(async(req, res, next) => {
        let query = Model.findById(req.params.id);
        if (populateOption) query = query.populate(populateOption);
        const doc = await query;

        !doc
            ?
            next(new AppError(`No Document found with id ${req.params.id}`, 404)) :
            res.status(200).json({
                status: 'success',
                data: doc,
            });
    });