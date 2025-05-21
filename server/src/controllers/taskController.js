const Task= require('../models/Task')
const validationToken = require('../features/validationToken')
const { validationResult } = require('express-validator')


class taskController{
  async createTask(req, res){
    try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Ошибка при создании проекта',
					errors: errors.array(),
				})
			}
      const taskColumnId = req.params.id  
			let userId
			try {
				userId = await validationToken(req)
			} catch (error) {
				return res.status(401).json({ success: false, message: error.message })
			}

      const newTask = await Task.createTask({
        taskColumnId,
        userId
      })

      return res.json({
        success: true,
        message: "Таск успешно создан",
        task: {
          id: newTask.task_id,
          title: newTask.title,
          taskColumnId: newTask.task_column_id,
          description: newTask.description,
          priority: newTask.priority
        }
      })
		} catch (e) {
			console.error(e)
			return res.status(500).json({ success: false, message: 'Ошибка сервера' })
		}
  }
}

module.exports = new taskController()