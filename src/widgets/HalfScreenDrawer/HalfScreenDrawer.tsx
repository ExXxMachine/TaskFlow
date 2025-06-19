import React from 'react'
import { Drawer, Box, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

interface HalfScreenDrawerProps {
	open: boolean
	onClose: () => void
	children: React.ReactNode
}

const HalfScreenDrawer: React.FC<HalfScreenDrawerProps> = ({
	open,
	onClose,
	children,
}) => {
	return (
		<Drawer
			anchor='right'
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					width: '50vw',
					maxWidth: '600px',
					transition: 'transform 0.3s ease-in-out',
          padding:'20px'
				},
			}}
			ModalProps={{
				keepMounted: true,
			}}
		>
			<Box sx={{ position: 'relative', height: '100%', p: 2 }}>
				<IconButton
					onClick={onClose}
					sx={{ position: 'absolute', top: 8, right: 8 }}
					aria-label='close'
				>
					<CloseIcon />
				</IconButton>
				{children}
			</Box>
		</Drawer>
	)
}

export default HalfScreenDrawer
