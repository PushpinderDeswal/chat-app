const mongoose = require('mongoose');

const url = process.env.DB_URI;

mongoose
  .connect(url)
  .then(() => console.log('Connected to DB'))
  .catch((e) => console.log('Error', e));
