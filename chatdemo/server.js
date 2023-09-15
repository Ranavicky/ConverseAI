const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const initializePassport = require("./passport-config");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const mongoose = require("mongoose");

// Load environment variables from .env file
require("dotenv").config();
const uri = "mongodb+srv://vicky:vicky@cluster0.psttixt.mongodb.net/";

// Connect to MongoDB using Mongoose
 mongoose.connect(uri);
initializePassport(
  passport,
  async (email) => await User.findOne({ email }),
  async (id) => await User.findById(id)
);

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: "hello world",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureFlash: true,
}));

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    await newUser.save();
    console.log(newUser); // Display newly registered user in the console
    res.redirect("/login");
  } catch (e) {
    console.log(e);
    res.redirect("/register");
  }
});

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { name: req.user.name });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.delete("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

app.listen(3000);
