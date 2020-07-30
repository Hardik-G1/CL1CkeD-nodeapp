var mongoose = require("mongoose");

var campgroundSchema = new mongoose.Schema({
    name: String,
    price: String,
    video1: [{ url: String, format: String, f: String, public_id: String, }],
    video: Number,
    images: [{ url: String, public_id: String, format: String }],
    format: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    created: { type: Date, default: Date.now },
    // desq: String,
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }]
});

module.exports = mongoose.model("Campground", campgroundSchema);

// Camp.create({
//     name: "salmon creek1",
//     image: "http://www.timferro.com/wordpress/wp-content/uploads/2017/11/azure-icon-250x250.png",
//     description: "this is a descriptiondbvhsdbviubswuvicbao"
// }, function(err, campground) {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log("new created");
//         console.log(campground);
//     }
// });