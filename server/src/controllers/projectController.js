const { validationResult } = require('express-validator')
require('dotenv').config()
const secret = process.env.SECRET
const User = require('../models/User')
const Project = require('../models/Project')
const jwt = require('jsonwebtoken')

const validationToken = async req => {
	console.log('JWT secret:', secret)
	const authHeader = req.headers.authorization
	console.log('authHeader:', authHeader)
	if (!authHeader) {
		throw new Error('Токен не предоставлен')
	}

	const tokenPayload = authHeader.split(' ')[1]
	console.log('tokenPayload:', tokenPayload)
	if (!tokenPayload) {
		throw new Error('Токен не предоставлен')
	}

	try {
		const decoded = jwt.verify(tokenPayload, secret)
		console.log('Decoded token:', decoded)
		const user = await User.findById(decoded.id)
		console.log('user:', user)
		if (!user) {
			throw new Error('Пользователь не найден')
		}
		return user.user_id
	} catch (error) {
		console.log('Ошибка при верификации токена:', error.message)
		throw new Error('Неверный или истёкший токен')
	}
}

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
