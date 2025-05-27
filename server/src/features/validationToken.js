require('dotenv').config()
const secret = process.env.SECRET
const User = require('../models/User')
const jwt = require('jsonwebtoken')

const validationToken = async req => {
	const authHeader = req.headers.authorization
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

module.exports = validationToken
