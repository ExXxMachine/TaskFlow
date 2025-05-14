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
	}),
})

export const { useCreateProjectMutation, useGetProjectsByUserIdQuery } = projectApi
