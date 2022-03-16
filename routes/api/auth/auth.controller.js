const jwt = require('jsonwebtoken')
const User = require('../../../models/user')
const db = require("../../../db")
const crypto = require('crypto')
const config = require('../../../config')


const verify = function (savedPwd, password) {
    const encrypted = crypto.createHmac('sha1', config.secret)
        .update(password)
        .digest('base64')

    return savedPwd === encrypted
}

const createUser = (username, password) => {
    const encrypted = crypto.createHmac('sha1', config.secret)
        .update(password)
        .digest('base64')

    db.audios.insert({username})
    return db.users.insert({ username, password: encrypted })
}

/*
    POST /api/auth/register
    {
        username,
        password
    }
*/

exports.register = (req, res) => {
    const { username, password } = req.body

    // create a new user if does not exist
    const create = (user) => {
        if (user) {
            throw new Error('username exists')
        } else {
            return createUser(username, password)
        }
    }

    // respond to the client
    const respond = (isAdmin) => {
        res.json({
            message: 'registered successfully',
            admin: isAdmin ? true : false
        })
    }

    // run when there is an error (username exists)
    const onError = (error) => {
        res.status(409).json({
            message: error.message
        })
    }

    // check username duplication
    // db.users.findOne({username})
    //     .then(create)
    //     .then(respond)
    //     .catch(onError)
    db.users.findOne({ username }, (err, doc) => {
        try {
            create(doc)
        } catch (error) {
            return onError(error)
        }
        respond(false)
    })
}

/*
    POST /api/auth/login
    {
        username,
        password
    }
*/

exports.login = (req, res) => {
    const { username, password } = req.body
    const secret = req.app.get('jwt-secret')

    // check the user info & generate the jwt
    const check = (user) => {
        // console.log("USER",user)
        if (!user) {
            console.log("!USER", user)
            // user does not exist
            throw new Error('login failed')
        } else {
            // user exists, check the password
            if (verify(user.password, password)) {
                // create a promise that generates jwt asynchronously
                const p = new Promise((resolve, reject) => {
                    jwt.sign(
                        {
                            _id: user._id,
                            username: user.username,
                            admin: user.admin
                        },
                        secret,
                        {
                            expiresIn: '7d',
                            issuer: 'inviz.ai',
                            subject: 'userInfo'
                        }, (err, token) => {
                            if (err) reject(err)
                            resolve(token)
                        })
                })
                return p
            } else {
                throw new Error('login failed')
            }
        }
    }

    // respond the token 
    const respond = (token) => {
        res.json({
            message: 'logged in successfully',
            token
        })
    }

    // error occured
    const onError = (error) => {
        res.status(403).json({
            message: error.message
        })
    }

    // find the user
    db.users.findOne({ username }, async (err, doc) => {
        try {
            const token = await check(doc)
            respond(token)
        } catch (error) {
            return onError(error)
        }
    })

}

/*
    GET /api/auth/check
*/

exports.check = (req, res) => {
    res.json({
        success: true,
        info: req.decoded
    })
}