const createError = require('http-errors');
const app = require('../config/app.js');
app.use(function(req, res, next) {
    next(createError(404));
});