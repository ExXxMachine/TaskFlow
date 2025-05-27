import React, { useState, useRef, useEffect } from 'react'
import { TaskCard } from '../TaskCard/TaskCard'
import { Paper, Typography, Stack, InputBase, Box } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import {
	useCreateTaskMutation,
	useUpdateTaskColumnMutation,
} from '../../store/slice/projectApi'
import { Droppable } from 'react-beautiful-dnd'
import DeleteIcon from '@mui/icons-material/Delete'
import { debounce } from 'lodash'

interface TaskCardProps {
	task_id: number
	task_column_id: number
	title: string
	priority: number
	executor_id: number | null
	owner_id: number
}

interface TaskColumnProps {
	taskColumnId: number
	taskColumnName: string
	taskList: TaskCardProps[]
	addTask: (taskColumnName: string, taskName: string) => void
	deleteTask: (taskId: number) => void
	deleteColumn: (TaskColumnId: number) => void
	userRole: string | null
}

const TaskColumn: React.FC<TaskColumnProps> = ({
	taskColumnId,
	taskColumnName,
	taskList,
	addTask,
	deleteTask,
	deleteColumn,
	userRole,
}) => {
	const [isEditing, setIsEditing] = useState(false)
	const [nameColumn, setNameColumn] = useState(taskColumnName)
	const [createTask, { isLoading }] = useCreateTaskMutation()
	const [updateTaskColumn] = useUpdateTaskColumnMutation()

	const debouncedUpdate = useRef(
		debounce(async (id: number, newName: string) => {
			try {
				await updateTaskColumn({ task_column_id: id, title: newName }).unwrap()
				console.log('Столбец обновлен')
			} catch (error) {
				console.error('Ошибка обновления столбца', error)
			}
		}, 1000)
	).current

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setNameColumn(event.target.value)
		debouncedUpdate(taskColumnId, event.target.value)
	}

	const handleBlur = () => {
		setIsEditing(false)
	}

	const handleDoubleClick = () => {
		if (userRole === 'owner') {
			setIsEditing(true)
		}
	}
	const handleAddTask = async () => {
		try {
			const newTask = await createTask(taskColumnId.toString()).unwrap()
			addTask(taskColumnId.toString(), newTask.task.title)
		} catch (error) {
			console.error('Ошибка при добавлении задачи', error)
		}
	}

	const handleDeleteColumn = () => {
		deleteColumn(taskColumnId)
		console.log(taskColumnId)
	}

	useEffect(() => {
		return () => {
			debouncedUpdate.cancel()
		}
	}, [debouncedUpdate])
	return (
		<Paper
			elevation={3}
			sx={{
				padding: 2,
				minWidth: 280,
				maxHeight: '60vh',

				display: 'flex',
				flexDirection: 'column',
				marginRight: '30px',
			}}
		>
			{isEditing ? (
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						mb: 2,
						'&:hover .delete-button': {
							visibility: 'visible',
						},
					}}
				>
					<InputBase
						value={nameColumn}
						onChange={handleChange}
						onBlur={handleBlur}
						autoFocus
						fullWidth
						sx={{ fontSize: '1rem', fontWeight: 500 }}
					/>
					{userRole === 'owner' && (
						<IconButton
							aria-label='delete column'
							onClick={handleDeleteColumn}
							sx={{ ml: 1 }}
							size='small'
							className='delete-button'
						>
							<DeleteIcon fontSize='small' />
						</IconButton>
					)}
				</Box>
			) : (
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						mb: 2,
						'&:hover .delete-button': {
							visibility: 'visible',
						},
					}}
				>
					<Typography
						variant='subtitle1'
						component='div'
						onDoubleClick={handleDoubleClick}
						sx={{ userSelect: 'none', fontSize: '20px' }}
					>
						{nameColumn}
					</Typography>
					{userRole === 'owner' && (
						<IconButton
							aria-label='delete column'
							onClick={handleDeleteColumn}
							size='small'
							className='delete-button'
							sx={{
								visibility: 'hidden',
								'&:hover': { visibility: 'visible' },
							}}
						>
							<DeleteIcon fontSize='small' />
						</IconButton>
					)}
				</Box>
			)}

			<Droppable droppableId={`${taskColumnId}`}>
				{(provided, snapshot) => (
					<Stack
						spacing={2}
						sx={{
							flexGrow: 1,
							height: 'calc(80vh - 100px)',
							overflowY: 'auto',
							overflowX: 'hidden',
						}}
						ref={provided.innerRef}
						{...provided.droppableProps}
					>
						{taskList.map((item, index) => (
							<TaskCard
								deleteTask={deleteTask}
								key={item.task_id}
								task_id={item.task_id}
								title={item.title}
								index={index}
								userRole={userRole}
							/>
						))}
						{provided.placeholder}
					</Stack>
				)}
			</Droppable>
			{userRole === 'owner' && (
				<IconButton
					color='primary'
					aria-label='add'
					sx={{
						marginTop: '15px',
						borderRadius: '5px',
					}}
					onClick={handleAddTask}
				>
					<AddIcon />
				</IconButton>
			)}
		</Paper>
	)
}

export { TaskColumn }
