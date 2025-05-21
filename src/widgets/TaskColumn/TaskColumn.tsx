import React, { useState } from 'react'
import { TaskCard } from '../TaskCard/TaskCard'
import { Paper, Typography, Stack, InputBase } from '@mui/material'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import { useCreateTaskMutation } from '../../store/slice/projectApi'
import {
	Droppable,
	DroppableProvided,
	DroppableStateSnapshot,
} from 'react-beautiful-dnd'
import DeleteIcon from '@mui/icons-material/Delete'
import { Box } from '@mui/material'

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
}

const TaskColumn: React.FC<TaskColumnProps> = ({
	taskColumnId,
	taskColumnName,
	taskList,
	addTask,
	deleteTask,
	deleteColumn,
}) => {
	const [isEditing, setIsEditing] = useState(false)
	const [nameColumn, setNameColumn] = useState(taskColumnName)
	const [createTask, { isLoading }] = useCreateTaskMutation()

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setNameColumn(event.target.value)
	}
	const handleBlur = () => {
		setIsEditing(false)
	}

	const handleDoubleClick = () => {
		setIsEditing(true)
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
	}
	return (
		<Paper
			elevation={3}
			sx={{
				padding: 2,
				minWidth: 280,
				maxHeight: '80vh',
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
					<IconButton
						aria-label='delete column'
						onClick={handleDeleteColumn}
						sx={{ ml: 1 }}
						size='small'
						className='delete-button'
					>
						<DeleteIcon fontSize='small' />
					</IconButton>
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
							/>
						))}
						{provided.placeholder}
					</Stack>
				)}
			</Droppable>

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
		</Paper>
	)
}

export { TaskColumn }
