const TaskColumn = require('../models/TaskColumn')
const validationToken = require('../features/validationToken')
const { validationResult } = require('express-validator')

class taskColumnController {
	async createTaskColumn(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Ошибка при создании проекта',
					errors: errors.array(),
				})
			}

			const title = 'Новый столбец'
			const project_id = req.params.id

			try {
				const userId = await validationToken(req)
			} catch (error) {
				return res.status(401).json({ success: false, message: error.message })
			}

			const newTaskColumn = await TaskColumn.createTaskColumn({
				title,
				project_id,
			})

			return res.json({
				success: true,
				message: 'Столбец успешно создан',
				taskColumn: {
					id: newTaskColumn.task_column_id,
					title: newTaskColumn.title,
					project_id: newTaskColumn.project_id,
				},
			})
		} catch (e) {
			console.error(e)
			return res.status(500).json({ success: false, message: 'Ошибка сервера' })
		}
	}

	async getTaskColumnList(req, res) {
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

			const project_id = req.params.id

			const columns = await TaskColumn.getTaskColumnByProjectId(project_id)

			if (!columns) {
				return res.status(500).json({
					success: false,
					message: 'Ошибка при получении списка столбцов',
				})
			}
			return res.json({
				success: true,
				columns,
			})
		} catch (error) {
			console.error(error)
			return res.status(500).json({ success: false, message: 'Ошибка сервера' })
		}
	}

	async deleteTaskColumn(req, res) {
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

			const task_column_id = req.params.id
			const result = await TaskColumn.deleteTaskColumnById(task_column_id)

			if (!result) {
				return res
					.status(500)
					.json({ success: false, message: 'Ошибка при удалении столбца' })
			}

			return res.json({
				success: true,
				message: 'Столбец и связанные задачи удалены',
			})
		} catch (error) {
			console.error(error)
			return res.status(500).json({ success: false, message: 'Ошибка сервера' })
		}
	}
	async updateTaskColumn(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Ошибка при обновлении столбца',
					errors: errors.array(),
				})
			}

			const task_column_id = req.params.id
			const title = req.body.title
			console.log('params:', req.params)
			console.log('body:', req.body)

			let userId
			try {
				userId = await validationToken(req)
			} catch (error) {
				return res.status(401).json({ success: false, message: error.message })
			}

			const updatedTaskColumn = await TaskColumn.updateTaskColumnById(
				task_column_id,
				title
			)

			if (!updatedTaskColumn) {
				return res
					.status(404)
					.json({ success: false, message: 'Столбец не найдена' })
			}

			return res.json({
				success: true,
				message: 'Столбец успешно обновлен',
				task: {
					id: updatedTaskColumn.task_column_id,
					title: updatedTaskColumn.title,
				},
			})
		} catch (e) {
			console.error(e)
			return res.status(500).json({ success: false, message: 'Ошибка сервера' })
		}
	}
}

module.exports = new taskColumnController()
