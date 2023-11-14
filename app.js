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
app.use((err, req, res, next) => {
    let status = err.status || 500;
    let message = err.message;

    return res.json({ error: { message, status } });
});

module.exports = app;
