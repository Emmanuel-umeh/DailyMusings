
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
var session      = require('express-session');
const path = require("path");
var morgan = require('morgan')
var cookieParser = require('cookie-parser');

var flash    = require('connect-flash');
var methodOverride = require('method-override')
const helmet = require('helmet')
const mongoose = require("mongoose");
const passport = require("passport")

const MongoStore = require('connect-mongo').default;
const app = express();
app.use(
  cors({
    // origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true
  })
);


// console.log("path", process.env.MONGO_URI)
app.use(express.json());

// mongoose uri

// const db = process.env.MONGO_URI
// console.log(db);

// Connect to mongoose
try{
  mongoose
  .connect( process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  useFindAndModify : false
  })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) =>{
    if(err){
      // return res.send({msg:err})
      console.log("error ", err)
    }
  });

}catch(e){
  if(e){
  return e
  }
}

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); //
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  /** VIEWS CONFIGURATION */
  /** SERVING PUBLIC FILES */
  app.use(express.static(path.join(__dirname, "public")));
  /** SERVING PUBLIC FILES */
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "ejs");
  /** VIEWS CONFIGURATION */
  app.use(session({ secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true})); // session secret
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session
 
  /** END PASPORT */
// Use Routes

// app.use('/', require('./routes/index'))
// app.use('/', require('./routes/user'))


/*** AUTH ROUTE */

app.use(methodOverride('_method'))



// app.use(helmet())


/** END AUTH ROUTE */
app.use('/', require('./routes/index'))










app.locals.title="DailyMusings"
app.locals.notifications = []
// app.localsauthenticated = !req.user.anonymous


app.set("port", process.env.PORT || 3333);
const server = app.listen(app.get("port"), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});

