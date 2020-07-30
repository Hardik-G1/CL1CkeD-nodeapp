var express = require("express");
var router = express.Router({ mergeparams: true });
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var moment = require("moment");


router.get("/c/:id/comments/new", middleware.isloggedin, function(req, res) {
    Campground.findById(req.params.id, function(err, foundca) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { title: 'comment big', campgrounds: foundca });
        }
    });
});


router.post("/c/:id/comments", middleware.isloggedin, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
            res.redirect("/c");
        } else {

            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    req.flash("error", "Something went Wrong");
                    console.log(err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "succesfully added");
                    res.redirect("/c/" + campground._id);
                }
            })

        }
    })
});
////////////////////////////

router.get("/c/:id/comments/:comment_id/edit", middleware.checkcomow, function(req, res) {
    Campground.findById(req.params.id, function(err, foundcamp) {
        if (err || !foundcamp) {
            req.flash("error", "Campground Not found");
            return res.redirect("/c");
        }
        Comment.findById(req.params.comment_id, function(err, foundcom) {
            if (err) {
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                res.render("comments/edit", { title: 'Edit', campground_id: req.params.id, comment: foundcom });
            }
        });
    });

});

router.put("/c/:id/comments/:comment_id", middleware.checkcomow, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, upda) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/c/" + req.params.id);
        }
    })
});
//////////////////////////////
router.delete("/c/:id/comments/:comment_id", middleware.checkcomow, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash("success", "Success");
            res.redirect("/c/" + req.params.id);
        }
    });
});

module.exports = router;