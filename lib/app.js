const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ extended: false }));
// eslint-disable-next-line no-irregular-whitespace
app.use(express.urlencoded({ extended: true })); 
app.use(require('./middleware/error'));

module.exports = app;
