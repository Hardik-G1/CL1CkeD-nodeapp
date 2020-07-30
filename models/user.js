var mongoose = require("mongoose");
var plm = require("passport-local-mongoose");
var userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: String,
    avatar: String,
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campground"
    }],
    reputation: { type: String, default: 'noob' },
    rPT: String,
    rPE: Date,
    email: { type: String, unique: true, required: true },
    isadmin: { type: Boolean, default: false }
});
userSchema.plugin(plm);
module.exports = mongoose.model("User", userSchema);