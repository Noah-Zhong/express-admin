const cookieParser = require('cookie-parser');
const app = require('../config/app.js');
app.use(cookieParser(process.env.COOKIEPARSER || 'inM2trj8WnxV9dEA'));
