const router = require('express').Router()
const { getAll, create, update, remove } = require('../controllers/user.controller')
const { authenticate, requireRole } = require('../middleware/auth.middleware')

router.use(authenticate, requireRole('ADMIN'))
router.get('/', getAll)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', remove)

module.exports = router
