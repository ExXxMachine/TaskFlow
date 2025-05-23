const Task = require('../models/Task')
const validationToken = require('../features/validationToken')
const { validationResult } = require('express-validator')

class taskController {
	async createTask(req, res) {
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
				userId,
			})

			return res.json({
				success: true,
				message: 'Таск успешно создан',
				task: {
					id: newTask.task_id,
					title: newTask.title,
					taskColumnId: newTask.task_column_id,
					description: newTask.description,
					priority: newTask.priority,
				},
			})
		} catch (e) {
			console.error(e)
			return res.status(500).json({ success: false, message: 'Ошибка сервера' })
		}
	}
	async deleteTaskById(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Ошибка при получении списка проектов',
					errors: errors.array(),
				})
			}

			try {
				const userId = await validationToken(req)
			} catch (error) {
				return res.status(401).json({ success: false, message: error.message })
			}
			const task_id = req.params.id
			console.log('task_id:', task_id)
			const result = await Task.deleteTaskById(task_id)

			if (!result) {
				return res
					.status(500)
					.json({ success: false, message: 'Ошибка при удалении задачи' })
			}

			return res.json({
				success: true,
				message: 'Задача удалена',
			})
		} catch (error) {
			console.error(error)
			return res.status(500).json({ success: false, message: 'Ошибка сервера' })
		}
	}
	async updateTask(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Ошибка при обновлении задачи',
					errors: errors.array(),
				})
			}

			const taskId = req.params.id
			const { title, description, priority, executor_id, task_column_id } =
				req.body
			console.log('params:', req.params)
			console.log('body:', req.body)
			let userId
			try {
				userId = await validationToken(req)
			} catch (error) {
				return res.status(401).json({ success: false, message: error.message })
			}

			const updatedTask = await Task.updateTaskById(taskId, {
				title,
				description,
				priority,
				executor_id,
				task_column_id,
			})

			if (!updatedTask) {
				return res
					.status(404)
					.json({ success: false, message: 'Задача не найдена' })
			}

			return res.json({
				success: true,
				message: 'Задача успешно обновлена',
				task: {
					id: updatedTask.task_id,
					title: updatedTask.title,
					taskColumnId: updatedTask.task_column_id,
					description: updatedTask.description,
					priority: updatedTask.priority,
					executor_id: updatedTask.executor_id,
				},
			})
		} catch (e) {
			console.error(e)
			return res.status(500).json({ success: false, message: 'Ошибка сервера' })
		}
	}
}

module.exports = new taskController()
