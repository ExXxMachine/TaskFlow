import { useState } from 'react'
import { TaskColumn } from '../../widgets/TaskColumn/TaskColumn'
import classesProject from './Project.module.css'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import { DragDropContext } from 'react-beautiful-dnd'

const projectDataTest = [
	{
		TaskColumnId: 1,
		TaskColumnName: 'Надо выполнить',
		taskList: [
			{
				taskId: 1,
				taskName: 'name1',
			},
			{
				taskId: 2,
				taskName: 'name2',
			},
			{
				taskId: 3,
				taskName: 'name3',
			},
		],
	},
	{
		TaskColumnId: 2,
		TaskColumnName: 'В работе',
		taskList: [
			{
				taskId: 4,
				taskName: 'name4',
			},
			{
				taskId: 5,
				taskName: 'name5',
			},
			{
				taskId: 6,
				taskName: 'name6',
			},
		],
	},
	{
		TaskColumnId: 3,
		TaskColumnName: 'Завершено',
		taskList: [],
	},
]

const Project = () => {
	const [projectData, setProjectData] = useState(projectDataTest)

	const addTask = (taskColumnName: string, taskName: string) => {
		setProjectData(prevData => {
			const allTaskIds = prevData.flatMap(col =>
				col.taskList.map(task => task.taskId)
			)
			const newTaskId = Math.max(...allTaskIds) + 1
			return prevData.map(column => {
				if (column.TaskColumnName === taskColumnName) {
					const newTask = { taskId: newTaskId, taskName }
					return {
						...column,
						taskList: [...column.taskList, newTask],
					}
				}
				return column
			})
		})
	}

	const addColumn = () => {
		setProjectData(prevData => {
			const allColumnIds = prevData.map(col => col.TaskColumnId)
			const maxId = allColumnIds.length > 0 ? Math.max(...allColumnIds) : 0
			const newColumnId = maxId + 1

			const newColumn = {
				TaskColumnId: newColumnId,
				TaskColumnName: 'Новая колонка',
				taskList: [],
			}

			return [...prevData, newColumn]
		})
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
				col => col.TaskColumnId.toString() === source.droppableId
			)
			const destColumnIndex = newData.findIndex(
				col => col.TaskColumnId.toString() === destination.droppableId
			)

			const sourceColumn = newData[sourceColumnIndex]
			const destColumn = newData[destColumnIndex]

			const sourceTasks = [...sourceColumn.taskList]
			const destTasks = [...destColumn.taskList]

			const [movedTask] = sourceTasks.splice(source.index, 1)

			if (sourceColumn === destColumn) {
				sourceTasks.splice(destination.index, 0, movedTask)
				newData[sourceColumnIndex] = {
					...sourceColumn,
					taskList: sourceTasks,
				}
			} else {
				destTasks.splice(destination.index, 0, movedTask)
				newData[sourceColumnIndex] = {
					...sourceColumn,
					taskList: sourceTasks,
				}
				newData[destColumnIndex] = {
					...destColumn,
					taskList: destTasks,
				}
			}

			return newData
		})
	}

	const deleteTask = (taskId: number) => {
		setProjectData(prevData => {
			return prevData.map(column => ({
				...column,
				taskList: column.taskList.filter(task => task.taskId !== taskId),
			}))
		})
	}

	const deleteColumn = (TaskColumnId: number) => {
		setProjectData(prevData => {
			return prevData.filter(column => column.TaskColumnId !== TaskColumnId)
		})
	}

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<div className={classesProject.projectColumnListBlock}>
				{projectData.map(item => (
					<TaskColumn
						key={item.TaskColumnName}
						TaskColumnId={item.TaskColumnId}
						taskColumnName={item.TaskColumnName}
						taskList={item.taskList}
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