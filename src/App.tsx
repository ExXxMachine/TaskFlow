import './App.css'
import { Project } from './pages/Project/Project'
import { HomePage } from './pages/Home/Home'
import { Header } from './widgets/Header/Header'
import { ProjectsList } from './pages/ProjectList/ProjectList'
import { AuthForm } from './pages/Authorization/Authorization'
import { Routes, Route } from 'react-router-dom'
import { InvitePage } from './widgets/Invite/Invite'

function App() {
	return (
		<>
			<Routes>
				<Route path='/' element={<Header />}>
					<Route path='/' element={<HomePage />} />
					<Route path='/project/:id' element={<Project />} />
					<Route path='/projects' element={<ProjectsList />} />
					<Route path='/login' element={<AuthForm isLoginMode={true} />} />
					<Route path='/register' element={<AuthForm isLoginMode={false} />} />
					<Route path='/invite/:token' element={<InvitePage />} />
				</Route>
			</Routes>
		</>
	)
}

export default App
