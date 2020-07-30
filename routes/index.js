var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var middleware = require("../middleware");
router.get("/", function(req, res) {
    res.redirect("/home");
    //res.render("landing", { title: 'Welcome' });
});
router.get("/landing", function(req, res) {
    res.render("landing", { title: 'Welcome' });
});
///=====auth routes======///
router.get("/signup", function(req, res) {
    res.render("signup", { title: 'Signup' });
});
router.post("/signup", function(req, res) {
    var newser = new User({ username: req.body.username, avatar: req.body.avatar, email: req.body.email });
    User.register(newser, req.body.password, function(err, user) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            passport.authenticate("local")(req, res, function() {
                req.flash("success", "Welcome " + user.username);
                res.redirect("/c");
            });
        }
    });
});
////////login////////////////
router.get("/login", function(req, res) {
    res.render("login", { title: 'Login' });
});
router.post("/login", passport.authenticate("local", {
    successRedirect: "/c",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: "Welcome back"
}), function(req, res) {
    req.flash("error", "please Check detials");
});
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "Logged out!");
    res.redirect("/c");
});
/////////////user profile///////////////
router.get("/users/:id", function(req, res) {
    User.findById(req.params.id).populate("favorites").exec(function(err, foundUser) {
        if (err || !foundUser) {
            req.flash("error", "Something went wrong.");
            return res.redirect("/c");
        }
        Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds) {
            if (err || !foundUser) {
                req.flash("error", "Something went wrong.");
                return res.redirect("/c");
            }
            res.render("users/show", { title: 'users', user: foundUser, campgrounds: campgrounds });
        })
    });
});


router.get("/users", function(req, res) {

    User.find(function(err, user) {
        if (err) {
            req.flash("error", "No user. I am lonely");
            res.redirect("/c");
        }
        res.render("users/all", { title: 'all', user: user });
    });
});
///////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
router.get("/forgot", function(req, res) {
    res.render("forgot", { title: 'you cannot remember you dimwit' });
});
router.post("/forgot", function(req, res, next) {
    async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString("hex");
                    done(err, token);
                });
            },
            function(token, done) {
                User.findOne({ email: req.body.email }, function(err, user) {
                    if (!user) {
                        req.flash("error", "No user found with that email");
                        return res.redirect("/forgot");
                    }
                    user.rPT = token;
                    user.rPE = Date.now() + 180000;
                    user.save(function(err) {
                        done(err, token, user);
                    });
                });
            },
            function(token, user, done) {
                var smtpTransport = nodemailer.createTransport({
                    service: "Gmail",
                    auth: {
                        user: process.env.MAIL,
                        pass: process.env.GMAILPW
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: "adol@wapismilega.com",
                    subject: "Password Reset Link",
                    text: "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
                        "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
                        "http://" + req.headers.host + "/reset/" + token + "\n\n" +
                        "If you did not request this, please ignore this email and your password will remain unchanged.\n"
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    if (err) {
                        console.log(err);
                        req.flash("error", "something went wrong");
                        return res.redirect("/forgot");
                    }
                    req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions.");
                    done(err, "done");
                });
            }
        ],
        function(err) {
            if (err)
                return next(err);
            res.redirect("/forgot");
        });
});
router.get("/reset/:token", function(req, res) {
    User.findOne({
        rPT: req.params.token,
        rPE: { $gt: Date.now() }
    }, function(err, user) {
        if (!user) {
            req.flash("error", "Password reset token is invalid or has expired");
            return res.redirect("/forgot");
        }
        res.render("reset", { token: req.params.token });
    });
});
router.post("/reset/:token", function(req, res) {
    async.waterfall([
            function(done) {
                User.findOne({ rPT: req.params.token, rPE: { $gt: Date.now() } }, function(err, user) {
                    if (!user) {
                        req.flash("error", "Password reset token is invalid or has expired");
                        return res.redirect("back");
                    }
                    if (req.body.password === req.body.confirm) {
                        user.setPassword(req.body.password, function(err) {
                            user.rPT = undefined;
                            user.rPE = undefined;
                            user.save(function(err) {
                                done(err, user);
                            });
                        })
                    } else {
                        req.flash("error", "passwords do not match");
                        return res.redirect("back");
                    }
                });
            },
            function(user, done) {
                var smtpTransport = nodemailer.createTransport({
                    service: "Gmail",
                    auth: {
                        user: process.env.MAIL,
                        pass: process.env.GMAILPW
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: "adol@wapismilega.com",
                    subject: "Password changed Confirmation",
                    text: "Hello,\n\n" +
                        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    req.flash("success", "Password Changed");
                    done(err);
                });
            }
        ],
        function(err) {
            res.redirect('/c');
        });
});
module.exports = router;