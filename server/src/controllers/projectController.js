const { validationResult } = require('express-validator')
require('dotenv').config()
const Project = require('../models/Project')
const validationToken = require('../features/validationToken')

class projectController {
	async createProject(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Ошибка при создании проекта',
					errors: errors.array(),
				})
			}

			const projectName = 'Новый проект'
			const description = 'Описание проекта'

			let userId
			try {
				userId = await validationToken(req)
			} catch (error) {
				return res.status(401).json({ success: false, message: error.message })
			}

			const newProject = await Project.createProject({
				projectName,
				description,
				userId,
			})

			return res.json({
				success: true,
				message: 'Проект успешно создан',
				project: {
					id: newProject.project_id,
					name: newProject.name,
					description: newProject.description,
				},
			})
		} catch (e) {
			console.error(e)
			return res.status(500).json({ success: false, message: 'Ошибка сервера' })
		}
	}
	async getProjectList(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Ошибка при получении списка проектов',
					errors: errors.array(),
				})
			}

			let userId
			try {
				userId = await validationToken(req)
			} catch (error) {
				return res.status(401).json({ success: false, message: error.message })
			}

			const projects = await Project.getProjectsByUserId(userId)

			if (!projects) {
				return res.status(500).json({
					success: false,
					message: 'Ошибка при получении проектов',
				})
			}

			return res.json({
				success: true,
				projects,
			})
		} catch (error) {
			console.error(error)
			return res.status(500).json({ success: false, message: 'Ошибка сервера' })
		}
	}
	async deleteProject(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Ошибка при получении списка проектов',
					errors: errors.array(),
				})
			}

			let userId
			try {
				userId = await validationToken(req)
			} catch (error) {
				return res.status(401).json({ success: false, message: error.message })
			}

			const project_id = req.params.id

			const result = await Project.deleteProjectById(project_id, userId)

			if (!result.success) {
				return res
					.status(403)
					.json({ success: false, message: result.message || 'Нет доступа' })
			}

			if (!result) {
				return res
					.status(500)
					.json({ success: false, message: 'Ошибка при удалении проекта' })
			}

			return res.json({
				success: true,
				message: 'Проект удален',
			})
		} catch (error) {
			console.error(error)
			return res.status(500).json({ success: false, message: 'Ошибка сервера' })
		}
	}
	async updateProject(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Ошибка при обновлении проекта',
					errors: errors.array(),
				})
			}

			const project_id = req.params.id
			const { name, description } = req.body

			let userId
			try {
				userId = await validationToken(req)
			} catch (error) {
				return res.status(401).json({ success: false, message: error.message })
			}

			const updatedProject = await Project.updateProjectById(project_id, {
				name,
				description,
			})

			if (!updatedProject) {
				return res
					.status(404)
					.json({ success: false, message: 'Проект не найден' })
			}

			return res.json({
				success: true,
				message: 'Проект успешно обновлен',
				project: {
					id: updatedProject.project_id,
					title: updatedProject.name,
					description: updatedProject.description,
				},
			})
		} catch (e) {
			console.error(e)
			return res.status(500).json({ success: false, message: 'Ошибка сервера' })
		}
	}
}

module.exports = new projectController()
