const Router = require('express')
const router = new Router()
const controller = require('../controllers/inviteController')
const { round } = require('lodash')

router.get('/:id', controller.createInviteLink)
router.post('/:token', controller.acceptInvite)


module.exports = router
