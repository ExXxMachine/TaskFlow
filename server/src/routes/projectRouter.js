const Router = require('express')
const router = new Router()
const controller = require('../controllers/projectController')
const taskColumnController = require('../controllers/taskColumnController')
const taskController = require('../controllers/taskController')

router.post('/', controller.createProject)
router.get('/', controller.getProjectList)
router.delete('/:id', controller.deleteProject)
router.patch('/:id', controller.updateProject)
router.get('/columns/:id', taskColumnController.getTaskColumnList)
router.post('/columns/:id', taskColumnController.createTaskColumn)
router.delete('/columns/:id', taskColumnController.deleteTaskColumn)
router.patch('/columns/:id', taskColumnController.updateTaskColumn)
router.post('/tasks/:id', taskController.createTask)
router.delete('/tasks/:id', taskController.deleteTaskById)
router.patch('/tasks/:id', taskController.updateTask)

module.exports = router
