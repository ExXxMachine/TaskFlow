import './App.css'
import { Project } from './pages/Project/Project'
import { HomePage } from './pages/Home/Home'
import { Header } from './widgets/Header/Header'
import { ProjectsList } from './pages/ProjectList/ProjectList'
import { Routes, Route } from 'react-router-dom'

function App() {
	return (
		<>
			<Routes>
				<Route path='/' element={<Header />}>
					<Route path='/' element={<HomePage />} />
					<Route path='/Project/:id' element={<Project />} />
					<Route path='/projects' element={<ProjectsList />} />
				</Route>
			</Routes>
		</>
	)
}

export default App
