const validationToken = require('../features/validationToken')
const { validationResult } = require('express-validator')
const Project = require('../models/Project')
const jwt = require('jsonwebtoken')
const secret = process.env.SECRET

const generateInviteToken = project_id => {
	const payload = { id: project_id }
	return jwt.sign(payload, secret, { expiresIn: '24h' })
}

const decodeInviteToken = token => {
	try {
		const payload = jwt.verify(token, secret)
		return payload.id
	} catch (err) {
		throw new Error('Неверный или просроченный токен приглашения')
	}
}

class inviteController {
	async createInviteLink(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Ошибка при создании ссылки',
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
			const token = generateInviteToken(project_id)
			const inviteLink = `http://localhost:5173/invite/${token}`

			if (!inviteLink) {
				return res
					.status(500)
					.json({ success: false, message: 'Ошибка создании ссылки' })
			}

			return res.json({
				success: true,
				message: 'Ссылка создана',
				link: inviteLink,
			})
		} catch (e) {
			console.error(e)
			return res.status(500).json({ success: false, message: 'Ошибка сервера' })
		}
	}
	async acceptInvite(req, res) {
		try {
			const authHeader = req.headers.authorization
			console.log('authHeader', authHeader)
			if (!authHeader || !authHeader.startsWith('Bearer ')) {
				return res
					.status(401)
					.json({ success: false, message: 'Нет токена пользователя' })
			}

			const userToken = authHeader.split(' ')[1]
			console.log('userToken', userToken)
			let userPayload
			try {
				userPayload = jwt.verify(userToken, secret)
			} catch {
				return res
					.status(401)
					.json({ success: false, message: 'Неверный токен пользователя' })
			}
			const userId = userPayload.id

			const token = req.params.token
			console.log('token', token)
			if (!token) {
				return res
					.status(400)
					.json({ success: false, message: 'Отсутствует токен приглашения' })
			}

			let projectId
			try {
				projectId = decodeInviteToken(token)
			} catch (error) {
				return res.status(400).json({ success: false, message: error.message })
			}

			const result = await Project.addUserToProject(projectId, userId)
			if (result.success) {
				return res.json({
					success: true,
					message: 'Пользователь добавлен в проект',
					project_id: projectId,
				})
			} else {
				return res.status(400).json({ success: false, message: result.message })
			}
		} catch (e) {
			console.error(e)
			return res.status(500).json({ success: false, message: 'Ошибка сервера' })
		}
	}
}

module.exports = new inviteController()
