const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const dotenv = require('dotenv').config();

//MongoUrl
const dbUrl = process.env.DB_URL;

var app = express();
const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

//MongoDB connection with mongoose.
const connection = mongoose.createConnection(dbUrl, dbOptions);

//parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//
const sessionStore = new MongoStore({
  mongoose_connection: connection,
  collection: "sessions",
  mongoUrl: dbUrl,
});

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 24 * 3600 * 1000, //one day in ms.
    },
  })
);

var trackVisitCount = (req, res, next) => {
  console.log("From visit-count middleware!");
  if (req.session.visitCount) {
    req.session.visitCount++;
  } else {
    req.session.visitCount = 1;
  }
  console.log(req.session);
  next();
};

app.get("/", trackVisitCount, (req, res) => {
  console.log("From main express callback");
  res.send(
    `<h1>You've visited this page ${req.session.visitCount} times.</h1>`
  );
});

app.listen(process.env.PORT || 3000);
