import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useCheckAuthQuery } from '../../store/slice/authApi'
import { getCookie, deleteCookie } from '../../features/cookieUtils'

const Header = () => {
	const navigate = useNavigate()
	const token = getCookie('token')
	const {
		data: userData,
		isLoading,
		isError,
	} = useCheckAuthQuery(undefined, {
		skip: !token,
	})

	const handleLogout = () => {
		deleteCookie('token')
		navigate('/login')
	}

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
					{token ? (
						<Button color='inherit' component={Link} to='/projects'>
							Мои проекты
						</Button>
					) : (
						<></>
					)}

					{token && userData && !isLoading && !isError ? (
						<Button color='inherit' onClick={handleLogout}>
							{userData.user.UserName}
						</Button>
					) : (
						<Button color='inherit' component={Link} to='/login'>
							Войти
						</Button>
					)}
				</Toolbar>
			</AppBar>
			<Outlet />
		</>
	)
}

export { Header }
