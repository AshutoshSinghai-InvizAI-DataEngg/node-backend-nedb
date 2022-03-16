const router = require('express').Router()
const controller = require('./words.controller')
const multer = require("multer")

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/uploads');
    },
    filename: function (req, file, callback) {
        const username = req.decoded.username
        const pid = req.params.pid
        const ext = file.originalname.split(".").slice(-1)[0]
        callback(null,`${username}-${pid}.${ext}`);
    }
});

router.get('/list', controller.list)
router.post("/upload/:pid", multer({ storage }).single('file'), controller.upload);

module.exports = router