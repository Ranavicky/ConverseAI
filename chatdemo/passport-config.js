const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("./models/User"); // Assuming you have a User model defined

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUsers = async (email, password, done) => {
    try {
      const user = await User.findOne({ email }); // Find user by email using Mongoose

      if (!user) {
        return done(null, false, { message: "No user found with that email" });
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (isPasswordMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Password Incorrect" });
      }
    } catch (error) {
      console.log(error);
      return done(error);
    }
  };

  passport.use(
    new LocalStrategy({ usernameField: "email" }, authenticateUsers)
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id); // Find user by ID using Mongoose
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  });
}

module.exports = initialize;
