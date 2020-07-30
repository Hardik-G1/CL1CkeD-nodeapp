var express = require("express");
var router = express.Router();
var moment = require("moment");
var Campground = require("../models/campground");
var User = require("../models/user");
var middleware = require("../middleware");
var multer = require('multer');
var { cloudinary, storage } = require("../cloudinary");
var upload1 = multer({ storage });
const tmpdir = require('os-tmpdir');
var upload = require('multer')({ dest: tmpdir() })
require('locus');

router.use(express.json());
router.get("/", function(req, res) {
    //get data from db
    var perpage = 36;
    var pagequery = parseInt(req.query.page);
    var pagenumber = pagequery ? pagequery : 1;
    if (req.query.search) {
        const regex = new RegExp(regExpEscape(req.query.search), "gi");
        if (isNaN(regex)) {
            Campground.find({ name: regex }).sort({ $natural: -1 }).skip((perpage * pagenumber) - perpage).limit(perpage).exec(function(_err, allcamp) {
                Campground.countDocuments({ name: regex }).exec(function(err, count) {
                    if (err) {
                        console.log(err);
                        res.redirect("back");
                    } else {
                        if (allcamp.length < 1) {
                            req.flash("error", "Campground not found");
                            return res.redirect("back");
                        }
                        res.render("campgrounds/fisrt.ejs", { data: allcamp, currentuser: req.user, current: pagenumber, pages: Math.ceil(count / perpage), search: req.query.search });
                    }
                });
            })
        } else {
            Campground.find({ video: regex }).sort({ $natural: -1 }).skip((perpage * pagenumber) - perpage).limit(perpage).exec(function(_err, allcamp) {
                Campground.countDocuments({ video: regex }).exec(function(err, count) {
                    if (err) {
                        console.log(err);
                        res.redirect("back");
                    } else {
                        if (allcamp.length < 1) {
                            req.flash("error", "Campground not found");
                            return res.redirect("back");
                        }
                        res.render("campgrounds/fisrt.ejs", { data: allcamp, currentuser: req.user, current: pagenumber, pages: Math.ceil(count / perpage), search: req.query.search });
                    }
                });
            })
        }

    } else {
        Campground.find({}).sort({ $natural: -1 }).skip((perpage * pagenumber) - perpage).limit(perpage).exec(function(_err, allcamp) {
            Campground.countDocuments({}).exec(function(err, count) {
                if (err) {
                    console.log(err);
                } else {
                    // console.log(allcamp.images)
                    console.log(allcamp.images);
                    res.render("campgrounds/fisrt.ejs", { data: allcamp, currentuser: req.user, current: pagenumber, pages: Math.ceil(count / perpage), search: false });
                }
            });
        });
    }
});


router.get("/n/v", middleware.isloggedin, function(_req, res) {
    res.render("campgrounds/new");
});
router.post("/n/v/n", middleware.isloggedin, function(req, res) {
    console.log(req.body);
    req.body.cat.video1 = [];
    req.body.cat.video1.push({
        f: req.body.cat.f,
        url: req.body.poster,
        format: "mp4"
    });
    req.body.cat.video = req.body.cat.video1.length;
    req.body.cat.author = {
        id: req.user._id,
        username: req.user.username
    }
    req.body.cat.created = new Date();
    console.log(req.body.cat);
    Campground.create(req.body.cat, function(err, campground) {
        if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        res.redirect('/c/' + campground.id);
    });


})
router.post("/", upload.array('images'), middleware.isloggedin, async function(req, res) {
    try {
        req.body.ca.video1 = [];
        for (var i = 0; i < req.files.length; i++) {
            await cloudinary.v2.uploader.upload(req.files[i].path, { resource_type: "auto", timeout: 900000, folder: req.body.ca.name }, function(error, result) {
                req.body.ca.video1.push({
                    url: result.secure_url,
                    format: result.format,
                    public_id: result.public_id
                });
                req.body.ca.author = {
                    id: req.user._id,
                    username: req.user.username
                }
                req.body.ca.created = new Date();
                ////if i get out of this then req.body.ca becomes undefined
            });

        }
        req.body.ca.video = req.body.ca.video1.length;
        console.log(req.body.ca);
        Campground.create(req.body.ca);
        req.flash("success", "Created");
        res.redirect("/c");
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("back");
    }

});

router.get("/n", middleware.isloggedin, function(_req, res) {
    res.render("campgrounds/new1");
});
router.get("/:id", function(req, res) {

    Campground.findById(req.params.id).populate("comments").exec(function(err, foundco) {
        if (err || !foundco) {
            req.flash("error", "Campground not found");
            res.redirect("/c");
        } else {
            console.log(req.isAuthenticated());
            if (req.isAuthenticated()) {
                User.findById(req.user.id).populate("favorites").exec(function(user) {

                    res.render("campgrounds/show", { campground: foundco, user: user });
                });
            }
            // console.log(foundco.images);
            res.render("campgrounds/show", { campgrounds: foundco });
        }

    });
});

//////////
router.get("/:id/full", function(req, res) {

    Campground.findById(req.params.id, function(err, foundco) {
        if (err || !foundco) {
            req.flash("error", "Campground not found");
            res.redirect("/c");
        } else {
            res.render("campgrounds/show2", { campgrounds: foundco });
        }


    });
});
router.get("/:id/all", function(req, res) {

    Campground.findById(req.params.id, function(err, foundco) {
        if (err || !foundco) {
            req.flash("error", "Campground not found");
            res.redirect("/c");
        } else {
            res.render("campgrounds/show1", { campgrounds: foundco });
        }


    });
});
router.get("/:id/edit", middleware.checkcampowner, function(req, res) {
    Campground.findById(req.params.id, function(err, foundcaa) {
        if (err) {
            req.flash("error", "Not Found");
        }
        res.render("campgrounds/edit", { campground: foundcaa });
    });
});



//////////////////////////
router.put("/:id", middleware.checkcampowner, function(req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.c, function(err, _updated) {
        if (err) {
            res.redirect("/c")
        } else {
            res.redirect("/c/" + req.params.id);
        }
    })
});
//////////   ////////////
router.delete("/:id", middleware.checkcampowner, function(req, res) {
    Campground.findById(req.params.id, async function(err, campground) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        try {
            for (var i = 0; i < campground.video1.length; i++) {
                await cloudinary.v2.uploader.destroy(campground.video1[i].public_id);
            }
            campground.remove();
            res.redirect("/c");
        } catch (err) {
            req.flash("error", err.message);
            res.redirect("back");
        }
    });
});

/////////favorite route/////////
router.post("/:id/favorite", middleware.isloggedin, function(req, res) {
    User.findById(req.user._id, function(err, user) {
        if (err) {
            console.log(err);
            return res.redirect("/c");
        }

        // check if req.user._id exists in foundCampground.favorites
        var foundUserfavorite = user.favorites.some(function(favorite) {
            return favorite.equals(req.params.id);
        });

        if (foundUserfavorite) {
            // user already favorited, removing favorite
            user.favorites.pull(req.params.id);
        } else {
            // adding the new user favorite
            user.favorites.push(req.params.id);
        }

        user.save(function(err) {
            if (err) {
                console.log(err);
                return res.redirect("/c");
            }
            return res.redirect("back");
        });
    });
});

function regExpEscape(literal_string) {
    return literal_string.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
}
module.exports = router;