import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getCookie } from '../../features/cookieUtils'


interface Invite {
	success: boolean
	message: string
	link: string
}

export const inviteApi = createApi({
	reducerPath: 'inviteApi',
	baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/invite' }),
	endpoints: builder => ({
		inviteUserInProject: builder.query<Invite, string | undefined>({
			query: project_id => ({
				url: `/${project_id}`,
				method: 'GET',
				headers: {
					Authorization: `Bearer ${getCookie('token')}`,
				},
			}),
		}),
		acceptInvite: builder.mutation({
			query: token => ({
				url: `/${token}`,
				method: 'POST',
				headers: {
					Authorization: `Bearer ${getCookie('token')}`,
				},
			}),
		}),
	}),
})

export const {
	useInviteUserInProjectQuery,
  useAcceptInviteMutation
} = inviteApi
