import React, { useState } from 'react'
import { Box, Button, TextField, Typography, Link, Paper } from '@mui/material'
import {
	useLoginMutation,
	useRegisterMutation,
} from '../../store/slice/authApi'
import { setCookie } from '../../features/cookieUtils'

interface AuthFormProps {
	isLoginMode: boolean
}

const AuthForm: React.FC<AuthFormProps> = ({ isLoginMode }) => {
	const [mode, setMode] = useState(isLoginMode)
	const [login, setLogin] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState('')

	const [loginMutation, { isLoading: isLoggingIn, error: loginError }] =
		useLoginMutation()
	const [registerMutation, { isLoading: isRegistering, error: registerError }] =
		useRegisterMutation()

	const toggleMode = () => {
		setError('')
		setLogin('')
		setEmail('')
		setPassword('')
		setConfirmPassword('')
		setMode(!mode)
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		if (mode) {
			if (!login || !password) {
				setError('Пожалуйста, заполните все поля')
				return
			}
		} else {
			if (!login || !email || !password || !confirmPassword) {
				setError('Пожалуйста, заполните все поля')
				return
			}
			if (password !== confirmPassword) {
				setError('Пароли не совпадают')
				return
			}
		}

		try {
			if (mode) {
				// Вход
				const res = await loginMutation({ username: login, password }).unwrap()
				setCookie('token', res.token, 7)
				window.location.href = '/projects'
			} else {
				// Регистрация
				const res = await registerMutation({
					username: login,
					email,
					password,
				}).unwrap()

				console.log('Регистрация успешна:', res)
			}
		} catch (error) {
			console.error('Ошибка:', error)
			setError('Произошла ошибка при отправке данных')
		}
	}

	return (
		<Box
			sx={{
				maxWidth: 400,
				mx: 'auto',
				mt: 8,
				p: 4,
				bgcolor: 'background.paper',
				borderRadius: 2,
				boxShadow: 3,
			}}
			component={Paper}
			elevation={3}
		>
			<Typography variant='h5' component='h1' align='center' gutterBottom>
				{mode ? 'Вход в аккаунт' : 'Регистрация'}
			</Typography>
			<Box component='form' onSubmit={handleSubmit} noValidate>
				<TextField
					label='Логин'
					fullWidth
					margin='normal'
					required
					value={login}
					onChange={e => setLogin(e.target.value)}
				/>
				{!mode && (
					<TextField
						label='Email'
						type='email'
						fullWidth
						margin='normal'
						required
						value={email}
						onChange={e => setEmail(e.target.value)}
					/>
				)}
				<TextField
					label='Пароль'
					type='password'
					fullWidth
					margin='normal'
					required
					value={password}
					onChange={e => setPassword(e.target.value)}
				/>
				{!mode && (
					<TextField
						label='Подтверждение пароля'
						type='password'
						fullWidth
						margin='normal'
						required
						value={confirmPassword}
						onChange={e => setConfirmPassword(e.target.value)}
					/>
				)}
				{error && (
					<Typography color='error' variant='body2' sx={{ mt: 1 }}>
						{error}
					</Typography>
				)}
				<Button
					type='submit'
					variant='contained'
					fullWidth
					sx={{ mt: 3, mb: 2 }}
					disabled={isLoggingIn || isRegistering}
				>
					{mode ? 'Войти' : 'Зарегистрироваться'}
				</Button>
			</Box>
			<Typography variant='body2' align='center'>
				{mode ? (
					<>
						Нет аккаунта?{' '}
						<Link component='button' onClick={toggleMode}>
							Зарегистрируйтесь
						</Link>
					</>
				) : (
					<>
						Уже есть аккаунт?{' '}
						<Link component='button' onClick={toggleMode}>
							Войдите
						</Link>
					</>
				)}
			</Typography>
		</Box>
	)
}

export { AuthForm }
