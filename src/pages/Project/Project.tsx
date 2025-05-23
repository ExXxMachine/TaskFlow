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
} from '@mui/material'
import {
	useGetTaskColumnByProjectIdQuery,
	useCreateTaskColumnMutation,
	useDeleteTaskColumnMutation,
	useDeleteProjectMutation,
	useUpdateProjectMutation,
	useUpdateTaskMutation,
} from '../../store/slice/projectApi'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { debounce } from 'lodash'

interface Task {
	task_id: number
	task_column_id: number
	title: string
	priority: number
	executor_id: number | null
	owner_id: number
}

interface TaskColumnType {
	task_column_id: number
	title: string
	project_id: number
	tasks: Task[]
}

const Project = () => {
	const location = useLocation()
	const { id } = useParams()
	const skip = !id
	const { data, error, isLoading } = useGetTaskColumnByProjectIdQuery(id!, {
		skip,
	})

	const navigation = useNavigate()
	const { name: initialName, description: initialDescription } =
		location.state || {}
	const [name, setName] = useState(initialName || '')
	const [description, setDescription] = useState(initialDescription || '')
	const [updateProject] = useUpdateProjectMutation()
	const [projectData, setProjectData] = useState<TaskColumnType[]>([])
	const [deleteProject] = useDeleteProjectMutation()
	const [updateTask] = useUpdateTaskMutation()

	const [createColumn] = useCreateTaskColumnMutation()
	const [deleteTaskColumn] = useDeleteTaskColumnMutation()

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const open = Boolean(anchorEl)

	const debouncedUpdate = useRef(
		debounce(async fields => {
			if (!id) return
			try {
				await updateProject({ project_id: id, ...fields }).unwrap()
				console.log('Проект обновлен', fields)
			} catch (error) {
				console.error('Ошибка обновления проекта', error)
			}
		}, 2000) 
	).current

	const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget)
	}

	const handleMenuClose = () => {
		setAnchorEl(null)
	}

	const handleInviteClick = () => {
		alert('Пригласить пользователя')
		handleMenuClose()
	}

	useEffect(() => {
		if (data?.columns) {
			setProjectData(data.columns)
			console.log(projectData)
		}
	}, [data])

	const handleDeleteProjectClick = async () => {
		if (!id) return
		try {
			await deleteProject(id).unwrap()
			handleMenuClose()
			navigation('/projects')
		} catch (error) {
			console.error('Ошибка при удалении проекта:', error)
		}
	}

	const addTask = (taskColumnId: string, taskName: string) => {
		setProjectData(prevData => {
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
			const newColumn = response.taskColumn || response
			setProjectData(prev => [...prev, { ...newColumn, tasks: [] }])
		} catch (error) {
			console.error('Ошибка при создании столбца', error)
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
		setProjectData(prevData =>
			prevData.map(column => ({
				...column,
				tasks: column.tasks.filter(task => task.task_id !== task_id),
			}))
		)
	}

	const deleteColumn = async (task_column_id: number) => {
		await deleteTaskColumn(task_column_id).unwrap()
		setProjectData(prevData => {
			return prevData.filter(column => column.task_column_id !== task_column_id)
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

				<InputBase
					value={name}
					onChange={e => setName(e.target.value)}
					sx={{
						fontSize: '2rem',
						fontWeight: 'bold',
						width: '100%',
						color: '#fff',
						mb: 1,
						borderBottom: '1px solid transparent',
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
					onChange={e => setDescription(e.target.value)}
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
					/>
				))}
				<IconButton
					color='primary'
					aria-label='add'
					sx={{ borderRadius: '5px' }}
					onClick={addColumn}
				>
					<AddIcon />
				</IconButton>
			</div>
		</DragDropContext>
	)
}

export { Project }
