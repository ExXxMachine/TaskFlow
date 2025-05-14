import { configureStore } from '@reduxjs/toolkit'
import { authApi } from './slice/authApi'
import { projectApi } from './slice/projectApi'

const store = configureStore({
	reducer: {
		[authApi.reducerPath]: authApi.reducer,
		[projectApi.reducerPath]: projectApi.reducer,
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware()
			.concat(authApi.middleware)
			.concat(projectApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
