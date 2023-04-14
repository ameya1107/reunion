const mongoose = require('mongoose');

const DATABASE_URL  = "mongodb+srv://ameya:ameya@crud-app.lo5p9k9.mongodb.net/reunion";

exports.connect = () => {
  mongoose
  .connect(DATABASE_URL, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
  })
  .then(console.log("DB Connected Sucessfully!"))
  .catch((error) => {
    console.log("DB Connection Failed!");
    console.log(error);
    process.exit(1);
  });
}
