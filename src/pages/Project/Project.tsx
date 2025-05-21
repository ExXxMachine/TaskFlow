import { useEffect, useState } from 'react'
import { TaskColumn } from '../../widgets/TaskColumn/TaskColumn'
import classesProject from './Project.module.css'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import { DragDropContext, DropResult } from 'react-beautiful-dnd'
import { useLocation } from 'react-router-dom'
import { Typography, Box } from '@mui/material'
import { useParams } from 'react-router-dom'
import {
	useGetTaskColumnByProjectIdQuery,
	useCreateTaskColumnMutation,
	useDeleteTaskColumnMutation,
} from '../../store/slice/projectApi'

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

	console.log(data)
	useEffect(() => {
		console.log(id)
	}, [])
	const { name, description } = location.state || {}
	const [projectData, setProjectData] = useState<TaskColumnType[]>([])

	const [createColumn] = useCreateTaskColumnMutation()
	const [deleteTaskColumn] = useDeleteTaskColumnMutation()

	useEffect(() => {
		if (data?.columns) {
			setProjectData(data.columns)
			console.log(projectData)
		}
	}, [data])

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

	const handleDragEnd = (result: DropResult) => {
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
				destTasks.splice(destination.index, 0, movedTask)
				newData[sourceColumnIndex] = {
					...sourceColumn,
					tasks: sourceTasks,
				}
				newData[destColumnIndex] = {
					...destColumn,
					tasks: destTasks,
				}
			}

			return newData
		})
	}

	const deleteTask = (task_id: number) => {
		setProjectData(prevData => {
			return prevData.map(column => ({
				...column,
				taskList: column.tasks.filter(task => task.task_id !== task_id),
			}))
		})
	}

	const deleteColumn = async (task_column_id: number) => {
		await deleteTaskColumn(task_column_id).unwrap()
		setProjectData(prevData => {
			return prevData.filter(column => column.task_column_id !== task_column_id)
		})
	}

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<Box sx={{ mb: 0, pt: 5, pl: 5, color: '#fff' }}>
				<Typography variant='h4' component='h1' gutterBottom>
					{name || 'Название проекта'}
				</Typography>
				<Typography variant='subtitle1' color='#fff'>
					{description || 'Описание проекта отсутствует'}
				</Typography>
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
