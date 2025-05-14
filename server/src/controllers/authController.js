const User = require('../models/User')
require('dotenv').config()
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const secret = process.env.SECRET

const generateAccessToken = UserId => {
	const payload = { id: UserId }
	return jwt.sign(payload, secret, { expiresIn: '24h' })
}

class AuthController {
	// Регистрация пользователя
	async registration(req, res) {
		try {
			const errors = validationResult(req)
			if (!errors.isEmpty()) {
				return res.status(400).json({
					success: false,
					message: 'Ошибка при регистрации',
					errors: errors.array(),
				})
			}

			const { username, email, password } = req.body

			if (!username || username.length < 3 || username.length > 20) {
				return res.status(400).json({
					success: false,
					message: 'Имя пользователя должно быть от 3 до 20 символов',
				})
			}

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			if (!email || !emailRegex.test(email)) {
				return res.status(400).json({
					success: false,
					message: 'Некорректный email',
				})
			}

			const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
			if (!password || !passwordRegex.test(password)) {
				return res.status(400).json({
					success: false,
					message: 'Пароль минимум 8 символов, включая буквы и цифры',
				})
			}

			// Проверка уникальности userLogin и userEmail
			const candidateLogin = await User.findByUserName(username)
			if (candidateLogin) {
				return res.status(400).json({
					success: false,
					message: 'Пользователь с таким логином уже существует',
				})
			}

			const hashPassword = await bcrypt.hash(password, 7)

			// Создаем пользователя
			const newUser = await User.createUser({
				username,
				email,
				password: hashPassword,
			})

			// Генерируем токен
			const token = generateAccessToken(newUser.id)

			return res.json({
				success: true,
				message: 'Пользователь успешно зарегистрирован',
				token,
				UserId: newUser.user_id,
				UserName: newUser.name,
			})
		} catch (e) {
			console.error(e)
			return res.status(500).json({ success: false, message: 'Ошибка сервера' })
		}
	}

	// Вход пользователя
	async login(req, res) {
		try {
			const { username, password } = req.body

			const user = await User.findByUserName(username)
			if (!user) {
				return res.status(400).json({ message: 'Неверный логин или пароль' })
			}

			const validPassword = await bcrypt.compare(password, user.password)
			if (!validPassword) {
				return res.status(400).json({ message: 'Неверный логин или пароль' })
			}

			const token = generateAccessToken(user.user_id)

			return res.json({
				success: true,
				token,
				UserId: user.user_id,
				UserName: user.name,
				message: 'Авторизация прошла успешно',
			})
		} catch (e) {
			console.error(e)
			return res.status(500).json({ message: 'Ошибка при входе' })
		}
	}

	// Получение данных пользователя по токен
	async getUserByToken(req, res) {
		const authHeader = req.headers.authorization
		console.log('Req:', authHeader)
		if (!authHeader)
			return res.status(401).json({ message: 'Токен не предоставлен' })

		const token = authHeader.split(' ')[1]
		if (!token)
			return res.status(401).json({ message: 'Токен не предоставлен' })

		try {
			const decoded = jwt.verify(token, secret)
			console.log('Decoded:', decoded)
			const user = await User.findById(decoded.id)
			console.log('User from DB:', user)
			if (!user) {
				return res.status(401).json({ message: 'Пользователь не найден' })
			}
			return res.json({
				success: true,
				user: {
					UserId: user.user_id,
					UserName: user.name,
				},
			})
		} catch (e) {
			return res.status(401).json({ message: 'Неверный или истёкший токен' })
		}
	}
}

module.exports = new AuthController()
