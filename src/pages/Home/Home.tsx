import React from 'react'
import { Container, Typography, Button, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const HomePage: React.FC = () => {
	const navigate = useNavigate()

	const handleStart = () => {
		navigate('/projects')
	}

	return (
		<Container
			maxWidth='sm'
			sx={{ textAlign: 'center', mt: 10, color: '#ffffff' }}
		>
			<Typography
				variant='h3'
				component='h1'
				gutterBottom
			>
				Добро пожаловать в TaskFlow!
			</Typography>
			<Typography variant='h6' color='#ffffff' paragraph>
				TaskFlow помогает вам работать продуктивнее благодаря чистому и
				интуитивному интерфейсу, позволяющему сосредоточиться на задачах и
				проектах.
			</Typography>
			<Typography variant='body1' color='#ffffff' paragraph>
				Управляйте задачами, отслеживайте статусы, планируйте и контролируйте
				выполнение - всё в одном удобном приложении.
			</Typography>
			<Box mt={4}>
				<Button variant='contained' size='large' onClick={handleStart}>
					Начать работу
				</Button>
			</Box>
		</Container>
	)
}

export { HomePage }
