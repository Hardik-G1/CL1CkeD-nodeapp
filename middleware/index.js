var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middlewareo = {};
middlewareo.checkcampowner = function(req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function(err, foundcaa) {
            if (err || !foundcaa) {
                req.flash("error", "Not Found");
                res.redirect("back");
            } else {
                // console.log(foundcaa.author.id);// console.log(req.user._id);
                if (foundcaa.author.id.equals(req.user._id) || req.user.isadmin) {
                    next();
                } else {
                    req.flash("error", "You Don't Have Permission");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please Login to Edit")
        res.redirect("back");
    }
}
middlewareo.checkcomow = function(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function(err, foundcomm) {
            if (err || !foundcomm) {
                req.flash("error", "Not Found");
                res.redirect("/c");
            } else {
                // console.log(foundcaa.author.id);// console.log(req.user._id);
                if (foundcomm.author.id.equals(req.user._id) || req.user.isadmin) {
                    next();
                } else {
                    req.flash("error", "Permission Denied");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please Login");
        res.redirect("back");
    }
}
middlewareo.isloggedin = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "Please Login!!");
    res.redirect("/login");
};
module.exports = middlewareo;