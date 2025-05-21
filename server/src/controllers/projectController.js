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

			console.log('userId:', userId)

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

			const projects = await Project.getProjectsByOwnerId(userId)

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
}

module.exports = new projectController()
