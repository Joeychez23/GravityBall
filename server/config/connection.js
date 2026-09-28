const mongoose = require("mongoose");
const DB_NAME = "google-books3";
const URI = `mongodb+srv://mydb:testval@Cluster0.haknbyf.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

module.exports = mongoose.connection;
