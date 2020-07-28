const multer = require("multer");

const imageFilter = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please upload an image"));
        }

        callback(undefined, true);
    },
});

module.exports = imageFilter;
