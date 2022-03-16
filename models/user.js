const crypto = require('crypto')
const config = require('../config')
const db = require("../db")


class User {
    constructor(username, password) {
        this.username = username
        this.password = password
    }

    save() {
        return new Promise((resolve, reject) => {
            db.users.insert({ username: this.username, password: this.password }, (err, doc) => {
                if (!err) resolve(doc)
                else reject(err)
            })
        })
    }

    verify = function (password) {
        const encrypted = crypto.createHmac('sha1', config.secret)
            .update(password)
            .digest('base64')

        return this.password === encrypted
    }

    static create = function (username, password) {
        const encrypted = crypto.createHmac('sha1', config.secret)
            .update(password)
            .digest('base64')

        const user = new this({
            username,
            password: encrypted
        })

        return user.save()
    }

    static findOneByUsername = (username) => {
        db.users.findOne({ username })
    }
}

module.exports = User