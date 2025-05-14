const Router = require('express')
const router = new Router()
const controller = require('../controllers/authController')
const { check } = require('express-validator')


router.post(
	'/registration',
	[
		check('username', 'Имя пользователя не может быть пустым').notEmpty(),
		check(
			'password',
			'Пароль не должен быть меньше 8 символов и больше 20 символов'
		).isLength({ min: 8, max: 20 }),
	],
	controller.registration
)
router.post('/login', controller.login)
router.get('/me', controller.getUserByToken)

module.exports = router
