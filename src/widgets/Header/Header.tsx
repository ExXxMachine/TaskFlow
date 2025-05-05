import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { Outlet, Link } from 'react-router-dom'

const Header = () => {
	return (
		<>
			<AppBar position='static'>
				<Toolbar>
					<Typography
						variant='h6'
						component={Link} 
						to='/' 
						sx={{
							flexGrow: 1,
							color: 'inherit', 
							textDecoration: 'none', 
							cursor: 'pointer',
						}}
					>
						TaskFlow
					</Typography>
					<Button color='inherit' component={Link} to='/projects'>
						Мои проекты
					</Button>
					<Button color='inherit' component={Link} to='/login'>
						Войти
					</Button>
				</Toolbar>
			</AppBar>
			<Outlet />
		</>
	)
}

export { Header }
