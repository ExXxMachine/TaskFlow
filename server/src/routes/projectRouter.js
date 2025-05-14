const Router = require('express')
const router = new Router()
const controller = require('../controllers/projectController')

router.post('/', controller.createProject)
router.get('/', controller.getProjectList)

module.exports = router   