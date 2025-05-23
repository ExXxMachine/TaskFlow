import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getCookie } from '../../features/cookieUtils'

interface ProjectResponse {
	success: boolean
	message: string
	project: {
		id: number
		name: string
		description: string
	}
}

interface Project {
	project_id: number
	name: string
	description: string
	owner_id: number
}

interface GetProjectsResponse {
	success: boolean
	projects: Project[]
}

interface TaskColumn {
	task_column_id: number
	title: string
	project_id: number
	tasks: Task[]
}

interface GetColumnsResponse {
	success: boolean
	columns: TaskColumn[]
}

interface Task {
	success: boolean
	message: string
	task: {
		id: number
		title: string
		taskColumnId: number
		description: string
		priority: number
	}
}

export const projectApi = createApi({
	reducerPath: 'projectApi',
	baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/projects' }),
	endpoints: builder => ({
		createProject: builder.mutation<ProjectResponse, void>({
			query: () => ({
				url: '/',
				method: 'POST',
				headers: {
					Authorization: `Bearer ${getCookie('token')}`,
				},
			}),
		}),
		getProjectsByUserId: builder.query<GetProjectsResponse, void>({
			query: () => ({
				url: '/',
				method: 'GET',
				headers: {
					Authorization: `Bearer ${getCookie('token')}`,
				},
			}),
		}),
		deleteProject: builder.mutation<
			{ success: boolean; message: string },
			string
		>({
			query: project_id => ({
				url: `/${project_id}`,
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${getCookie('token')}`,
				},
			}),
		}),
		updateProject: builder.mutation({
			query: ({ project_id, ...patch }) => ({
				url: `/${project_id}`,
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${getCookie('token')}`,
				},
				body: patch,
			}),
		}),
		createTaskColumn: builder.mutation<TaskColumn, string>({
			query: project_id => ({
				url: `/columns/${project_id}`,
				method: 'POST',
				headers: {
					Authorization: `Bearer ${getCookie('token')}`,
				},
			}),
		}),
		getTaskColumnByProjectId: builder.query<GetColumnsResponse, string>({
			query: project_id => ({
				url: `/columns/${project_id}`,
				method: 'GET',
				headers: {
					Authorization: `Bearer ${getCookie('token')}`,
				},
			}),
		}),
		deleteTaskColumn: builder.mutation<
			{ success: boolean; message: string },
			number
		>({
			query: task_column_id => ({
				url: `/columns/${task_column_id}`,
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${getCookie('token')}`,
				},
			}),
		}),
		updateTaskColumn: builder.mutation({
			query: ({ task_column_id, title }) => ({
				url: `/columns/${task_column_id}`,
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${getCookie('token')}`,
				},
				body: {
					title: title
				},
			}),
		}),
		createTask: builder.mutation<Task, string>({
			query: task_column_id => ({
				url: `/tasks/${task_column_id}`,
				method: 'POST',
				headers: {
					Authorization: `Bearer ${getCookie('token')}`,
				},
			}),
		}),
		deleteTask: builder.mutation<{ success: boolean; message: string }, number>(
			{
				query: task_id => ({
					url: `/tasks/${task_id}`,
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${getCookie('token')}`,
					},
				}),
			}
		),
		updateTask: builder.mutation({
			query: ({ task_id, ...patch }) => ({
				url: `/tasks/${task_id}`,
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${getCookie('token')}`,
				},
				body: patch,
			}),
		}),
	}),
})

export const {
	useCreateProjectMutation,
	useGetProjectsByUserIdQuery,
	useDeleteProjectMutation,
	useUpdateProjectMutation,
	useGetTaskColumnByProjectIdQuery,
	useCreateTaskColumnMutation,
	useDeleteTaskColumnMutation,
	useUpdateTaskColumnMutation,
	useCreateTaskMutation,
	useDeleteTaskMutation,
	useUpdateTaskMutation,
} = projectApi
