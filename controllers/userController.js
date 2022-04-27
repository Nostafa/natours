exports.getAppTours = (req, res) => {
    res.status(200).json({
        message: 'Hello From Server Side!',
        timer: req.requestTime,
        app: 'natours',
    });
};

exports.createAppTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
            message: 'Hello From Server Side!',
        },
    });
};