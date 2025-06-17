import { useEffect, useState, useRef } from 'react'
import { TaskColumn } from '../../widgets/TaskColumn/TaskColumn'
import classesProject from './Project.module.css'
import AddIcon from '@mui/icons-material/Add'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
	Box,
	TextareaAutosize,
	InputBase,
	IconButton,
	Menu,
	MenuItem,
	Typography,
	Modal,
	Button,
} from '@mui/material'
import {
	useGetTaskColumnByProjectIdQuery,
	useCreateTaskColumnMutation,
	useDeleteTaskColumnMutation,
	useDeleteProjectMutation,
	useUpdateProjectMutation,
	useUpdateTaskMutation,
	useGetProjectByIdQuery,
} from '../../store/slice/projectApi'
import { useInviteUserInProjectQuery } from '../../store/slice/inviteApi'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { debounce } from 'lodash'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { confirmAlert } from 'react-confirm-alert'
import 'react-confirm-alert/src/react-confirm-alert.css'
import './customConfirmAlert.css'
import { TaskColumnInt } from '../../store/slice/projectApi'

interface Task {
	task_id: number
	task_column_id: number
	title: string
	priority: number
	executor_id: number | null
	owner_id: number
}

const styleModal = {
	position: 'absolute' as const,
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	bgcolor: 'background.paper',
	borderRadius: 1,
	boxShadow: 24,
	p: 4,
	minWidth: 300,
	textAlign: 'center',
}

const Project = () => {
	const location = useLocation()
	const { id } = useParams()
	const skip = !id
	const { data: dataProject, refetch } = useGetProjectByIdQuery(id, {
		refetchOnMountOrArgChange: true,
	})
	const { data, error, isLoading } = useGetTaskColumnByProjectIdQuery(id!, {
		skip,
	})

	const navigation = useNavigate()
	const [name, setName] = useState(dataProject?.project.name || '')
	const [description, setDescription] = useState(
		dataProject?.project.description || ''
	)
	const [updateProject] = useUpdateProjectMutation()
	const [projectData, setProjectData] = useState<TaskColumnInt[]>([])
	const [deleteProject] = useDeleteProjectMutation()
	const [updateTask] = useUpdateTaskMutation()

	const [createColumn] = useCreateTaskColumnMutation()
	const [deleteTaskColumn] = useDeleteTaskColumnMutation()

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const open = Boolean(anchorEl)
	const [userRole, setUserRole] = useState<string | null>(null)
	const [openInviteModal, setOpenInviteModal] = useState(false)
	const { data: inviteData } = useInviteUserInProjectQuery(id, {
		refetchOnMountOrArgChange: true,
	})

	const debouncedUpdate = useRef(
		debounce(async fields => {
			if (!id) return
			try {
				await updateProject({ project_id: id, ...fields }).unwrap()
				console.log('Проект обновлен', fields)
			} catch (error: unknown) {
				if (
					typeof error === 'object' &&
					error !== null &&
					'data' in error &&
					typeof (error as any).data === 'object' &&
					(error as any).data !== null &&
					'message' in (error as any).data
				) {
					toast.error(<div>{(error as any).data.message}</div>, {
						position: 'bottom-right',
					})
				} else if (error instanceof Error) {
					toast.error(<div>{error.message}</div>, { position: 'bottom-right' })
				} else {
					toast.error(<div>Неизвестная ошибка</div>, {
						position: 'bottom-right',
					})
				}
			}
		}, 2000)
	).current

	useEffect(() => {
		refetch()
	}, [id, refetch])

	useEffect(() => {
		if (dataProject) {
			setName(dataProject.project.name)
			setDescription(dataProject.project.description)
		}
	}, [dataProject])

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget)
	}

	const handleMenuClose = () => {
		setAnchorEl(null)
	}

	const handleInviteClick = () => {
		setOpenInviteModal(true)
		handleMenuClose()
	}

	const handleInviteModalClose = () => {
		setOpenInviteModal(false)
	}

	const handleCopyInvite = async () => {
		console.log(inviteData?.link)
		if (!inviteData?.link) {
			toast.error('Ссылка приглашения недоступна', { position: 'bottom-right' })
			return
		}

		try {
			await navigator.clipboard.writeText(inviteData.link)
			toast.success('Ссылка-приглашение скопирована!', {
				position: 'bottom-right',
			})
		} catch {
			toast.error('Ошибка при копировании текста', { position: 'bottom-right' })
		}
	}

	useEffect(() => {
		if (data?.columns) {
			console.log('данные проекта:', data)
			setProjectData(data.columns)
			setUserRole(data.role)
			console.log('Роль пользователя в проекте:', data.role)
		}
	}, [data])

	const handleDeleteProjectClick = () => {
		confirmAlert({
			title: 'Подтверждение удаления',
			message: 'Вы уверены, что хотите удалить этот проект?',
			buttons: [
				{
					label: 'Да',
					onClick: async () => {
						if (!id) return
						try {
							await deleteProject(id).unwrap()
							handleMenuClose()
							navigation('/projects', {
								state: { successMessage: 'Проект успешно удалён' },
							})
						} catch (error: unknown) {
							if (
								typeof error === 'object' &&
								error !== null &&
								'data' in error &&
								typeof (error as any).data === 'object' &&
								(error as any).data !== null &&
								'message' in (error as any).data
							) {
								toast.error(<div>{(error as any).data.message}</div>, {
									position: 'bottom-right',
								})
							} else if (error instanceof Error) {
								toast.error(<div>{error.message}</div>, {
									position: 'bottom-right',
								})
							} else {
								toast.error(<div>Неизвестная ошибка</div>, {
									position: 'bottom-right',
								})
							}
						}
					},
				},
				{
					label: 'Нет',
					onClick: () => {},
				},
			],
		})
	}

	const addTask = (taskColumnId: string, taskName: string) => {
		console.log(taskColumnId)
		console.log(taskName)
		setProjectData(prevData => {
			console.log('prevData в addTask:', prevData)
			const allTaskIds = prevData.flatMap(col =>
				col.tasks.map(task => task.task_id)
			)
			const newTaskId = allTaskIds.length > 0 ? Math.max(...allTaskIds) + 1 : 1

			return prevData.map(column => {
				if (column.task_column_id.toString() === taskColumnId) {
					const newTask: Task = {
						task_id: newTaskId,
						task_column_id: column.task_column_id,
						title: taskName,
						priority: 0,
						executor_id: null,
						owner_id: 0,
					}
					toast.success('Задача добавлена', { position: 'bottom-right' })
					return {
						...column,
						tasks: [...column.tasks, newTask],
					}
				}
				return column
			})
		})
	}

	const addColumn = async () => {
		try {
			if (!id) return
			const response = await createColumn(id).unwrap()
			const newColumn = response
			setProjectData(prev => [...prev, { ...newColumn, tasks: [] }])
			toast.success('Столбец создан', { position: 'bottom-right' })
		} catch (error: unknown) {
			if (
				typeof error === 'object' &&
				error !== null &&
				'data' in error &&
				typeof (error as any).data === 'object' &&
				(error as any).data !== null &&
				'message' in (error as any).data
			) {
				toast.error(<div>{(error as any).data.message}</div>, {
					position: 'bottom-right',
				})
			} else if (error instanceof Error) {
				toast.error(<div>{error.message}</div>, { position: 'bottom-right' })
			} else {
				toast.error(<div>Неизвестная ошибка</div>, { position: 'bottom-right' })
			}
		}
	}

	const handleDragEnd = async (result: DropResult) => {
		const { source, destination } = result
		if (!destination) return

		if (
			source.droppableId === destination.droppableId &&
			source.index === destination.index
		)
			return

		setProjectData(prevData => {
			const newData = [...prevData]

			const sourceColumnIndex = newData.findIndex(
				col => col.task_column_id.toString() === source.droppableId
			)
			const destColumnIndex = newData.findIndex(
				col => col.task_column_id.toString() === destination.droppableId
			)

			const sourceColumn = newData[sourceColumnIndex]
			const destColumn = newData[destColumnIndex]

			const sourceTasks = [...sourceColumn.tasks]
			const destTasks = [...destColumn.tasks]

			const [movedTask] = sourceTasks.splice(source.index, 1)

			if (sourceColumn === destColumn) {
				sourceTasks.splice(destination.index, 0, movedTask)
				newData[sourceColumnIndex] = {
					...sourceColumn,
					tasks: sourceTasks,
				}
			} else {
				const updatedTask = {
					...movedTask,
					task_column_id: destColumn.task_column_id,
				}
				destTasks.splice(destination.index, 0, updatedTask)
				newData[sourceColumnIndex] = {
					...sourceColumn,
					tasks: sourceTasks,
				}
				newData[destColumnIndex] = {
					...destColumn,
					tasks: destTasks,
				}
				updateTask({
					task_id: movedTask.task_id,
					task_column_id: destColumn.task_column_id,
				})
			}

			return newData
		})
	}

	const deleteTask = (task_id: number) => {
		confirmAlert({
			title: 'Подтверждение удаления',
			message: 'Вы уверены, что хотите удалить эту задачу?',
			buttons: [
				{
					label: 'Да',
					onClick: async () => {
						setProjectData(prevData =>
							prevData.map(column => ({
								...column,
								tasks: column.tasks.filter(task => task.task_id !== task_id),
							}))
						)
						toast.success('Задача удалена', { position: 'bottom-right' })
					},
				},
				{
					label: 'Нет',
					onClick: () => {},
				},
			],
		})
	}

	const deleteColumn = async (task_column_id: number) => {
		confirmAlert({
			title: 'Подтверждение удаления',
			message: 'Вы уверены, что хотите удалить этот столбец?',
			buttons: [
				{
					label: 'Да',
					onClick: async () => {
						try {
							await deleteTaskColumn(task_column_id).unwrap()
							setProjectData(prevData =>
								prevData.filter(
									column => column.task_column_id !== task_column_id
								)
							)
							toast.success('Столбец удалён', { position: 'bottom-right' })
						} catch (error: unknown) {
							if (
								typeof error === 'object' &&
								error !== null &&
								'data' in error &&
								typeof (error as any).data === 'object' &&
								(error as any).data !== null &&
								'message' in (error as any).data
							) {
								toast.error(<div>{(error as any).data.message}</div>, {
									position: 'bottom-right',
								})
							} else if (error instanceof Error) {
								toast.error(<div>{error.message}</div>, {
									position: 'bottom-right',
								})
							} else {
								toast.error(<div>Неизвестная ошибка</div>, {
									position: 'bottom-right',
								})
							}
						}
					},
				},
				{
					label: 'Нет',
					onClick: () => {},
				},
			],
		})
	}

	useEffect(() => {
		if (name.trim() !== '') {
			debouncedUpdate({ name })
		}
	}, [name, debouncedUpdate])

	useEffect(() => {
		debouncedUpdate({ description })
	}, [description, debouncedUpdate])

	useEffect(() => {
		return () => {
			debouncedUpdate.cancel()
		}
	}, [debouncedUpdate])

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<Box sx={{ position: 'relative', pt: 4, pl: 5, color: '#fff' }}>
				{userRole === 'owner' && (
					<IconButton
						aria-label='more'
						aria-controls={open ? 'project-menu' : undefined}
						aria-haspopup='true'
						aria-expanded={open ? 'true' : undefined}
						onClick={handleMenuOpen}
						sx={{
							position: 'absolute',
							top: 16,
							right: 16,
							color: '#fff',
							zIndex: 10,
						}}
					>
						<MoreVertIcon />
					</IconButton>
				)}
				<InputBase
					value={name}
					onChange={e => userRole === 'owner' && setName(e.target.value)}
					readOnly={userRole !== 'owner'}
					sx={{
						fontSize: '2rem',
						fontWeight: 'bold',
						width: '100%',
						color: '#fff',
						mb: 1,
						borderBottom: '1px solid transparent',
						opacity: userRole === 'owner' ? 1 : 0.7,
						cursor: userRole === 'owner' ? 'text' : 'not-allowed',
						'&:focus': {
							borderBottom: '1px solid #fff',
							outline: 'none',
						},
					}}
					placeholder='Введите название проекта'
					inputProps={{ maxLength: 100 }}
				/>
				<TextareaAutosize
					value={description}
					onChange={e => userRole === 'owner' && setDescription(e.target.value)}
					readOnly={userRole !== 'owner'}
					placeholder='Введите описание проекта'
					style={{
						width: '100%',
						minHeight: 20,
						fontSize: '1rem',
						color: '#fff',
						backgroundColor: 'transparent',
						border: 'none',
						resize: 'vertical',
						outline: 'none',
						padding: 0,
						marginTop: 8,
						opacity: userRole === 'owner' ? 1 : 0.7,
						cursor: userRole === 'owner' ? 'text' : 'not-allowed',
					}}
					maxLength={500}
				/>
				<Menu
					id='project-menu'
					anchorEl={anchorEl}
					open={open}
					onClose={handleMenuClose}
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					transformOrigin={{
						vertical: 'top',
						horizontal: 'right',
					}}
				>
					<MenuItem onClick={handleInviteClick}>Пригласить</MenuItem>
					<MenuItem onClick={handleDeleteProjectClick}>Удалить проект</MenuItem>
				</Menu>
			</Box>
			<Modal
				open={openInviteModal}
				onClose={handleInviteModalClose}
				aria-labelledby='invite-modal-title'
				aria-describedby='invite-modal-description'
			>
				<Box sx={styleModal}>
					<Typography
						id='invite-modal-title'
						variant='h6'
						component='h2'
						gutterBottom
					>
						Пригласить пользователя
					</Typography>
					<Typography id='invite-modal-description' sx={{ mb: 2 }}>
						Нажмите кнопку ниже, чтобы скопировать ссылку приглашения
					</Typography>
					<Button
						variant='contained'
						onClick={handleCopyInvite}
						disabled={!inviteData?.link}
					>
						Скопировать приглашение
					</Button>
				</Box>
			</Modal>
			<div className={classesProject.projectColumnListBlock}>
				{projectData.map(item => (
					<TaskColumn
						key={item.title}
						taskColumnId={item.task_column_id}
						taskColumnName={item.title}
						taskList={item.tasks}
						addTask={addTask}
						deleteTask={deleteTask}
						deleteColumn={deleteColumn}
						userRole={userRole}
					/>
				))}
				{userRole === 'owner' && (
					<IconButton
						color='primary'
						aria-label='add'
						sx={{ borderRadius: '5px' }}
						onClick={addColumn}
					>
						<AddIcon />
					</IconButton>
				)}
			</div>
			<ToastContainer />
		</DragDropContext>
	)
}

export { Project }
