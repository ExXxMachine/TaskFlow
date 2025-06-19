import React, { useState, useRef } from 'react'
import {
	Card,
	CardContent,
	Typography,
	InputBase,
	IconButton,
} from '@mui/material'
import { Draggable } from 'react-beautiful-dnd'
import DeleteIcon from '@mui/icons-material/Delete'
import {
	useDeleteTaskMutation,
	useUpdateTaskMutation,
} from '../../store/slice/projectApi'
import { debounce } from 'lodash'

interface TaskCardProps {
	task_id: number
	title: string
	index: number
	deleteTask: (task_id: number) => void
	userRole: string | null
	onClick?: () => void
}

const TaskCard: React.FC<TaskCardProps> = ({
	task_id,
	title,
	index,
	deleteTask,
	userRole,
	onClick
}) => {
	const [name, setName] = useState(title)
	const [isEditing, setIsEditing] = useState(false)
	const [deleteTaskById] = useDeleteTaskMutation()
	const [updateTask] = useUpdateTaskMutation()

	const debouncedUpdate = useRef(
		debounce(async (taskId: number, newTitle: string) => {
			try {
				await updateTask({ task_id: taskId, title: newTitle }).unwrap()
			} catch (e) {
				console.error('Ошибка при обновлении задачи', e)
			}
		}, 2000)
	).current

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = event.target.value
		setName(newValue)
		debouncedUpdate(task_id, newValue)
	}

	const handleBlur = () => {
		setIsEditing(false)
	}

	const handleDoubleClick = () => {
		if (userRole === 'owner') {
			setIsEditing(true)
		}
	}

	const handleDeleteTask = () => {
		deleteTask(task_id)
		deleteTaskById(task_id)
	}

	React.useEffect(() => {
		return () => {
			debouncedUpdate.cancel()
		}
	}, [debouncedUpdate])

	return (
		<Draggable draggableId={task_id.toString()} index={index}>
			{provided => (
				<Card
					onClick={onClick}
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					variant='outlined'
					sx={{
						cursor: 'pointer',
						'&:hover': { boxShadow: 6 },
						'&:hover .delete-button': {
							visibility: 'visible',
							opacity: 1,
						},
						minHeight: '90px',
					}}
				>
					<CardContent>
						{isEditing ? (
							<InputBase
								value={name}
								onChange={handleChange}
								onBlur={handleBlur}
								autoFocus
								fullWidth
								sx={{ fontSize: '1rem', fontWeight: 500 }}
							/>
						) : (
							<div
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									gap: 8,
								}}
							>
								<Typography
									variant='subtitle1'
									component='div'
									onDoubleClick={handleDoubleClick}
									sx={{ userSelect: 'none', flexGrow: 1 }}
								>
									{name}
								</Typography>
								{userRole === 'owner' && (
									<IconButton
										aria-label='delete task'
										onClick={handleDeleteTask}
										size='small'
										className='delete-button'
										sx={{
											visibility: 'hidden',
											opacity: 0,
											transition: 'opacity 0.3s ease, visibility 0.3s ease',
											minWidth: 'auto',
											padding: 0,
										}}
									>
										<DeleteIcon fontSize='small' />
									</IconButton>
								)}
							</div>
						)}
						<Typography
							variant='caption'
							color='text.secondary'
							sx={{ marginTop: 1 }}
						>
							ID: {task_id}
						</Typography>
					</CardContent>
				</Card>
			)}
		</Draggable>
	)
}

export { TaskCard }
