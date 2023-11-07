const logger = require('morgan');
const app = require('../config/app.js');
app.use(logger('dev'));