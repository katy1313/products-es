const express = require("express");
require("express-async-errors");
const app = express();

//extra security packages
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')

app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));

require("dotenv").config(); // to load the .env file into the process.env object
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;

const store = new MongoDBStore({
  // may throw an error, which won't be caught
  uri: url,
  collection: "mySessions",
});
store.on("error", function (error) {
  console.log(error);
});

const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

if (app.get("env") === "production") {
  app.set("trust proxy", 1); // trust first proxy
  sessionParms.cookie.secure = true; // serve secure cookies
}

app.use(session(sessionParms));

/* ----------------- Passport ----------------- */
const passport = require("passport");
const passportInit = require("./passport/passportInit");  //registers our local Passport strategy, and sets up the serializeUser and deserializeUser functions onto the passport object

passportInit();
app.use(passport.initialize()); //sets up Passport to work with Express and sessions
app.use(passport.session()); //which sets up an Express middleware that runs on all requests, checks the session cookie for a user id, and if it finds one, deserializes and attaches it to the req.user property


/* ----------------- Flash messages ----------------- */
app.use(require("connect-flash")()); // handles flash messages to inform the user of the results
app.use(require("./middleware/storeLocals"));

/* ----------------- CSRF Protection ----------------- */
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
app.use(cookieParser("use_a_secure_secret"))


// CSRF middleware with __Host- cookie
const csrfProtection = csrf({
  cookie: {
    key: "csrftoken",
    httpOnly: true,
    secure: app.get("env") === "production", // require HTTPS in prod
    sameSite: "strict",
    path: "/", // required for __Host-
  },
});

app.use(csrfProtection);

// Makes token available to all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
});

// extra packages
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 100, //limit each IP to 100 request per window
}))
app.use(helmet())
app.use(cors())
app.use(xss())


/* ----------------- Routes ----------------- */
app.use("/sessions", require("./routes/sessionRoutes"));

app.get("/", (req, res) => {
  res.render("index");
});

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// secret word handling
const secretWordRouter = require("./routes/secretWord");
const auth = require("./middleware/auth");
app.use("/secretWord", auth, secretWordRouter);
const productsRouter = require('./routes/products')
app.use("/products", auth, productsRouter);
const ordersRouter = require('./routes/orders');
app.use('/orders', auth, ordersRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


/* ----------------- Error Handling ----------------- */
// app.use((req, res) => {
//   res.status(404).send(`That page (${req.url}) was not found.`);
// });

// app.use((err, req, res, next) => {
//   res.status(500).send(err.message);
//   console.log(err);
// });



/* ----------------- Server Start ----------------- */
const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await require("./db/connect")(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();