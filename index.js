const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const passport = require("passport");
var path = require("path");
require("dotenv").config();

var cookies = require("cookie-parser");

const port = process.env.PORT || 8000;

const app = express();
app.use(cookies());

// middleware for bodyparser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Adding middleware to serve static files. Use of style.css as static file
app.use(express.static(path.join(__dirname, "public")));

//SETUP HANDLEBARS
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
  }),
);
app.set("view engine", ".hbs");

// get settings
const settings = require("./config/settings");

// mongo db url
const db = settings.mongoDBUrl;

// attempt to connect with DB
mongoose
  .connect(db)
  .then(() => console.log("MongoDB connected successfully."))
  .catch((err) => console.log(err));

// Get profile routes
const route = require("./routes/api/cars");
const auth = require("./routes/api/auth");

// mapping to actual routes
app.use("/", auth);
app.use("/", route);

// // Config for JWT strategy
// require("./strategies/jsonwtStrategy")(passport);

app.listen(port, () => console.log(`App running at port : ${port}`));
