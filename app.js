/** BizTime express application. */

const express = require('express');

const app = express();
const ExpressError = require('./expressError');
const companyRoutes = require('./routes/companies');

app.use(express.json());
app.use('/companies', companyRoutes);

/** 404 handler */
app.use(function (req, res, next) {
    const err = new ExpressError('Not Found', 404);
    return next(err);
});

/** general error handler */
app.use((error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';

    return res.status(status).json({
        error: { message, status },
    });
});

module.exports = app;
