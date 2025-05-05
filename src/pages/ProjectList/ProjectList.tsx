import React, { useState } from 'react'
import {
	Container,
	Typography,
	Grid,
	Card,
	CardContent,
	CardActions,
	Button,
	Box,
	IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'

interface Project {
	id: number
	name: string
	description: string
	color: string
}

const initialProjects: Project[] = [
	{
		id: 1,
		name: 'Проект «Вдохновение»',
		description: 'Творческий проект для генерации идей и вдохновения.',
		color: '#FF6F61',
	},
	{
		id: 2,
		name: 'Проект «Технологии»',
		description: 'Разработка инновационных решений и прототипов.',
		color: '#6B5B95',
	},
	{
		id: 3,
		name: 'Проект «Маркетинг»',
		description: 'Стратегии продвижения и анализа рынка.',
		color: '#88B04B',
	},
	{
		id: 4,
		name: 'Проект «Образование»',
		description: 'Создание обучающих материалов и курсов.',
		color: '#F7CAC9',
	},
]

const ProjectsList: React.FC = () => {
	const navigate = useNavigate()
	const [projectsList, setProjectsList] = useState<Project[]>(initialProjects)
	const [isCreating, setIsCreating] = useState(false) 

	const handleOpenProject = (id: number) => {
		navigate(`/Project/${id}`)
	}

	const handleAddProject = () => {
		if (isCreating) return 

		setIsCreating(true)

		// Генерируем новый ID
		const newId =
			projectsList.length > 0 ? Math.max(...projectsList.map(p => p.id)) + 1 : 1

	
		const newProject: Project = {
			id: newId,
			name: 'Новый проект',
			description: 'Описание нового проекта',
			color: '#607d8b', 
		}

		
		setProjectsList(prev => [...prev, newProject])


		navigate(`/Project/${newId}`)
		setIsCreating(false)
	  }

	if (projectsList.length === 0) {
		return (
			<Box
				sx={{
					minHeight: '100vh',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					p: 3,
				}}
			>
				<Button
					variant='outlined'
					startIcon={<AddIcon />}
					onClick={handleAddProject}
					disabled={isCreating}
					sx={{
						width: '60%',
						height: 80,
						fontSize: '1.5rem',
						borderColor: 'rgba(255, 255, 255, 0.6)',
						color: 'rgba(255, 255, 255, 0.8)',
						'&:hover': {
							backgroundColor: 'rgba(255, 255, 255, 0.12)',
							borderColor: 'rgba(255, 255, 255, 0.9)',
							color: '#fff',
						},
					}}
				></Button>
			</Box>
		)
	}

	return (
		<Box sx={{ minHeight: '100vh', py: 6 }}>
			<Container maxWidth='lg'>
				<Typography
					variant='h3'
					align='center'
					gutterBottom
					sx={{ fontWeight: 'bold', mb: 6, color: '#ffffff' }}
				>
					Ваши проекты
				</Typography>
				<Grid container spacing={4}>
					{projectsList.map(({ id, name, description, color }) => (
						<Grid item xs={12} sm={6} md={4} key={id}>
							<Card
								sx={{
									height: '100%',
									backgroundColor: color,
									color: '#fff',
									display: 'flex',
									flexDirection: 'column',
									justifyContent: 'space-between',
									boxShadow: '0 8px 15px rgba(0,0,0,0.1)',
									transition: 'transform 0.3s ease, box-shadow 0.3s ease',
									'&:hover': {
										transform: 'translateY(-10px)',
										boxShadow: '0 15px 25px rgba(0,0,0,0.3)',
									},
								}}
							>
								<CardContent>
									<Typography variant='h5' component='h2' gutterBottom>
										{name}
									</Typography>
									<Typography variant='body1' sx={{ opacity: 0.85 }}>
										{description}
									</Typography>
								</CardContent>
								<CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
									<Button
										variant='contained'
										onClick={() => handleOpenProject(id)}
										sx={{
											backgroundColor: '#fff',
											color: color,
											fontWeight: 'bold',
											'&:hover': {
												backgroundColor: '#f0f0f0',
											},
										}}
									>
										Открыть
									</Button>
								</CardActions>
							</Card>
						</Grid>
					))}

					<Grid item xs={12} sm={6} md={4}>
						<Card
							onClick={handleAddProject}
							sx={{
								height: '100%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: isCreating ? 'default' : 'pointer',
								border: '2px dashed rgba(255, 255, 255, 0.6)',
								backgroundColor: 'rgba(255, 255, 255, 0.05)',
								color: 'rgba(255, 255, 255, 0.8)',
								transition:
									'background-color 0.3s ease, border-color 0.3s ease',
								pointerEvents: isCreating ? 'none' : 'auto',
								'&:hover': {
									backgroundColor: isCreating
										? 'rgba(255, 255, 255, 0.05)'
										: 'rgba(255, 255, 255, 0.12)',
									borderColor: isCreating
										? 'rgba(255, 255, 255, 0.6)'
										: 'rgba(255, 255, 255, 0.9)',
									color: isCreating ? 'rgba(255, 255, 255, 0.8)' : '#fff',
								},
							}}
							variant='outlined'
						>
							<CardContent
								sx={{
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									justifyContent: 'center',
									gap: 1,
								}}
							>
								<IconButton
									aria-label='add project'
									sx={{ fontSize: 48, color: 'rgba(255, 255, 255, 0.8)' }}
									size='large'
									disabled={isCreating}
								>
									<AddIcon fontSize='inherit' />
								</IconButton>
								<Typography variant='h6' sx={{ color: 'inherit' }}>
									{isCreating ? 'Создание...' : 'Добавить проект'}
								</Typography>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</Container>
		</Box>
	)
}

export { ProjectsList }
