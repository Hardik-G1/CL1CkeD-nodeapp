var express = require("express");
var app = express();
require('dotenv').config()
var bodyparser = require("body-parser");
var mongoose = require("mongoose");
var passport = require("passport");
var localp = require("passport-local");
var plm = require("passport-local-mongoose");
var moment = require("moment");
var methodOverride = require("method-override");
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
var Campground = require("./models/campground");
var Comment = require("./models/comment");
var User = require("./models/user");
var flash = require("connect-flash");
mongoose.connect(process.env.MONGOURL, {

    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true

}).then(() => {

    console.log('Connected to DB');

}).catch(err => {
    console.log('ERROR :', err.message);

});
//////////////////////////
var campgroundroute = require("./routes/campgrounds");
var commentroute = require("./routes/comments");
var indexroute = require("./routes/index");
//////////////////////////
app.use(bodyparser.urlencoded({ extended: true }));
app.use(flash());
app.locals.moment = require("moment");

app.use(methodOverride("_method"));
app.use(require("express-session")({
    secret: "1",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localp(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
///////////////////////
app.use(function(req, res, next) {
    res.locals.currentuser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})
app.use(indexroute);
app.use("/c", campgroundroute);
app.use(commentroute);
app.get("/home", function(req, res) {
    Campground.find({}).exec(function(err, allcamp) {
        if (err) {
            req.flash("error", err);
        } else {
            res.render("campgrounds/try.ejs", { data: allcamp, currentuser: req.user, search: false });
        }
    });
});
app.get("*", function(req, res) {
    res.send("Error 404 page not found ")
})
app.listen(process.env.PORT || 3000, function() {
    console.log("server started");
});