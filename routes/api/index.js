const router = require('express').Router()
const authMiddleware = require('../../middlewares/auth')
const auth = require('./auth')
const user = require('./user')
const words = require('./words')

router.use('/auth', auth)
router.use('/user', authMiddleware)
router.use('/words', authMiddleware)
router.use('/user', user)
router.use("/words",words)

module.exports = router