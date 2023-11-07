const express = require('express');//引入express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

module.exports = app;