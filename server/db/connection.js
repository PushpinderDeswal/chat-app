const mongoose = require('mongoose');

// const url = process.env.DB_URI;
const url = `mongodb+srv://pushpinderdeswal02:TqKJ0EWKFkvVn0Ti@clustersocialspace.7sb0wq1.mongodb.net/?retryWrites=true&w=majority&appName=ClusterSocialSpace`;

mongoose
  .connect(url)
  .then(() => console.log('Connected to DB'))
  .catch((e) => console.log('Error', e));
