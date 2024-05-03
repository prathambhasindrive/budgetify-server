const mongoose = require("mongoose");
require('dotenv').config();

const dbConnect =  () => {
    mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Database Connected successfully"))
    .catch((err) => {
      console.log("Error While Connecting to the Database " + err);
      process.exit(1);
    });
};

module.exports = dbConnect;
