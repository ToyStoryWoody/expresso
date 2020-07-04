const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('errorhandler');
const morgan = require('morgan');

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(errorHandler());
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => { console.log(`Listening on port ${PORT}`) });

const apiRouter = require('./api/api');
app.use('/api', apiRouter);

module.exports = app;