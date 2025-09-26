const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

const passportInit = () => {
  passport.use(
    "local",
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" }, // Telling strategy what field on the request will have the user identifier(email), and what field will have the password (password field)
      async (email, password, done) => { //callback called when we do passport.authenticate(...) in the login route in sessionRoutes.js
        try {
          const user = await User.findOne({ email: email });
          if (!user) {
            return done(null, false, { message: "Incorrect credentials." });
          }

          const result = await user.comparePassword(password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Incorrect credentials." });
          }
        } catch (e) {
          return done(e);
        }
      }
    )
  );

  // is used when saving a user to the request session object.
  //We can’t save an object to the session cookie, so we need to “serialize” it a.k.a. encode it as a string.
  //telling Passport to save just the user id to the session cookie
  passport.serializeUser(async function (user, done) {
    done(null, user.id);
  });

  //when Passport is handling a protected route, it will use the deserializeUser function to retrieve the user from the database, 
  //using the id that was saved to the session cookie
  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id);
      if (!user) {
        return done(new Error("user not found"));
      }
      return done(null, user);
    } catch (e) {
      done(e);
    }
  });
};

module.exports = passportInit;