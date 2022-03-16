const User = require('../../../models/user')
const db = require("../../../db")
/* 
    GET /api/user/list
*/

exports.list = (req, res) => {
    db.users.find({}, (err, docs) => {
        res.json({ users: docs })
    })
}