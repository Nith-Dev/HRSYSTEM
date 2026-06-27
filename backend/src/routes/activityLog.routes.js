const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth.middleware')
const { getRecent } = require('../controllers/activityLog.controller')

router.get('/', authenticate, getRecent)

module.exports = router
