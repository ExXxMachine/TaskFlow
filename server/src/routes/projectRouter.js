const Router = require('express')
const router = new Router()
const controller = require('../controllers/projectController')
const taskColumnController = require('../controllers/taskColumnController')
const taskController = require('../controllers/taskController')

router.post('/', controller.createProject)
router.get('/', controller.getProjectList)
router.get('/columns/:id', taskColumnController.getTaskColumnList)
router.post('/columns/:id', taskColumnController.createTaskColumn)
router.delete('/columns', taskColumnController.deleteTaskColumn)
router.post('/tasks/:id', taskController.createTask)

module.exports = router
