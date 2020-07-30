const crypto = require("crypto");
const cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name: 'dtarijclg',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const cloudinaryStorage = require("multer-storage-cloudinary");
const storage = cloudinaryStorage({
    cloudinary,
    folder: 'ezama',
    allowedFormats: ['pdf', 'jpeg', 'jpg', 'png', 'gif'],
    filename: function(req, file, cb) {
        let buf = crypto.randomBytes(16);
        buf = buf.toString('hex');
        let uniqFileName = file.originalname.replace(/\.pdf|\.jpg|\.png|\.gif|\.jpeg/ig, '');
        uniqFileName += buf;
        cb(undefined, uniqFileName);
    }

});
module.exports = {
    cloudinary,
    storage
}