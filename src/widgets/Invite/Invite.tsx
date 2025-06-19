import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAcceptInviteMutation } from '../../store/slice/inviteApi'
import { toast } from 'react-toastify'

const InvitePage = () => {
	const { token } = useParams<{ token: string }>()
	const [acceptInvite] = useAcceptInviteMutation()

	useEffect(() => {
		if (!token) return

		acceptInvite(token)
			.unwrap()
			.then(result => {
				toast.success('Приглашение принято!')
				console.log(result.project_id)
				window.location.href = `/project/${result.project_id}`
			})
			.catch(() => {
				toast.error('Ошибка при принятии приглашения')
			})
	}, [token, acceptInvite])
  

	return <div></div>
}

export { InvitePage }
