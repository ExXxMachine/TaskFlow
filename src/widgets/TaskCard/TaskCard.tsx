import React, { useState } from 'react'
import {
	Card,
	CardContent,
	Typography,
	InputBase,
	IconButton,
} from '@mui/material'
import { Draggable } from 'react-beautiful-dnd'
import DeleteIcon from '@mui/icons-material/Delete'

interface TaskCardProps {
	taskId: number
	taskName: string
	index: number
	deleteTask: (taskId: number) => void
}

const TaskCard: React.FC<TaskCardProps> = ({
	taskId,
	taskName,
	index,
	deleteTask,
}) => {
	const [name, setName] = useState(taskName)
	const [isEditing, setIsEditing] = useState(false)

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setName(event.target.value)
	}

	const handleBlur = () => {
		setIsEditing(false)
	}

	const handleDoubleClick = () => {
		setIsEditing(true)
	}

	const handleDeleteTask = () => {
		deleteTask(taskId)
	}

	return (
		<Draggable draggableId={taskId.toString()} index={index}>
			{provided => (
				<Card
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					variant='outlined'
					sx={{
						cursor: 'pointer',
						'&:hover': { boxShadow: 6 },
						// При наведении на карточку показываем кнопку удаления
						'&:hover .delete-button': {
							visibility: 'visible',
							opacity: 1,
						},
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
							</div>
						)}
						<Typography
							variant='caption'
							color='text.secondary'
							sx={{ marginTop: 1 }}
						>
							ID: {taskId}
						</Typography>
					</CardContent>
				</Card>
			)}
		</Draggable>
	)
}

export { TaskCard }
