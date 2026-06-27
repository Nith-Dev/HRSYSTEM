const router = require('express').Router()
const ctrl = require('../controllers/rank.controller')
const { authenticate, requireRole } = require('../middleware/auth.middleware')

router.use(authenticate)

router.get('/', ctrl.getAll)
router.post('/', requireRole('ADMIN'), ctrl.create)
router.put('/:id', requireRole('ADMIN'), ctrl.update)
router.delete('/:id', requireRole('ADMIN'), ctrl.remove)

module.exports = router
