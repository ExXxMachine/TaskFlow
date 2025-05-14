import React, { useState, useEffect } from 'react'
import {
	Container,
	Typography,
	Card,
	CardContent,
	CardActions,
	Button,
	Box,
	IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import Grid from '@mui/material/Grid'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import {
	useGetProjectsByUserIdQuery,
	useCreateProjectMutation,
} from '../../store/slice/projectApi'

interface Project {
	project_id: number
	name: string
	description: string
	owner_id: number
}

const ProjectsList: React.FC = () => {
	const navigate = useNavigate()
	const location = useLocation()

	const { data, error, isLoading, refetch } = useGetProjectsByUserIdQuery()
	const [projectsList, setProjectsList] = useState<Project[]>([])
	const [createProject] = useCreateProjectMutation()

	const [isCreating, setIsCreating] = useState(false)

	useEffect(() => {
		if (data?.projects) {
			setProjectsList(data.projects)
		}
	}, [data])

	useEffect(() => {
		refetch()
	}, [location.pathname, refetch])

	const handleAddProject = async () => {
		try {
			const response = await createProject().unwrap()
			const createdProject = response.project
			navigate(`/Project/${createdProject.id}`, {
				state: {
					name: createdProject.name,
					description: createdProject.description,
				},
			})
		} catch (error) {
			console.error('Ошибка при создании проекта:', error)
		}
	}

	if (projectsList.length === 0) {
		return (
			<Box
				sx={{
					minHeight: '100vh',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					p: 3,
					gap: 2,
					textAlign: 'center',
				}}
			>
				<Typography variant='h6' color='rgba(255, 255, 255, 0.8)'>
					У вас пока нет проектов
				</Typography>
				<Typography variant='h6' color='rgba(255, 255, 255, 0.8)'>
					Чтобы создать новый проект, нажмите на кнопку ниже
				</Typography>
				<Button
					variant='outlined'
					startIcon={<AddIcon />}
					onClick={handleAddProject}
					disabled={isCreating}
					sx={{
						width: '60%',
						height: 80,
						mt: 10,
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
					{projectsList.map(({ project_id, name, description }) => (
						<Link
							to={`/Project/${project_id}`}
							state={{ description: description, name: name }}
							style={{ textDecoration: 'none' }}
						>
							<Grid item xs={12} sm={6} md={4} key={project_id}>
								<Card
									sx={{
										height: '100%',
										backgroundColor: '#1976d2',
										color: '#fff',
										minWidth: '300px',
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
											sx={{
												backgroundColor: '#fff',
												color: '#1976d2',
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
						</Link>
					))}

					<Grid item xs={12} sm={6} md={4}>
						<Card
							onClick={handleAddProject}
							sx={{
								height: '100%',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								minWidth: '200px',
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
