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
	task_id: number
	title: string
	index: number
	deleteTask: (task_id: number) => void
}

const TaskCard: React.FC<TaskCardProps> = ({
	task_id,
	title,
	index,
	deleteTask,
}) => {
	const [name, setName] = useState(title)
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
		deleteTask(task_id)
	}

	return (
		<Draggable draggableId={task_id.toString()} index={index}>
			{provided => (
				<Card
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
						minHeight:'90px'
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
									onClick={() => deleteTask(task_id)}
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
							ID: {task_id}
						</Typography>
					</CardContent>
				</Card>
			)}
		</Draggable>
	)
}

export { TaskCard }
