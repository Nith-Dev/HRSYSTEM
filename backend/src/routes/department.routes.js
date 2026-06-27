const router = require('express').Router()
const ctrl = require('../controllers/department.controller')
const { authenticate, requireRole } = require('../middleware/auth.middleware')

router.use(authenticate)

router.get('/', ctrl.getAll)
router.get('/:id', ctrl.getById)
router.post('/', requireRole('ADMIN', 'HR'), ctrl.create)
router.put('/:id', requireRole('ADMIN', 'HR'), ctrl.update)
router.delete('/:id', requireRole('ADMIN'), ctrl.remove)

module.exports = router
