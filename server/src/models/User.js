const pool = require('../config/db') 

async function getUserRole(project_id, user_id) {
	const res = await pool.query(
		`SELECT role FROM "AccessList" WHERE project_id = $1 AND user_id = $2`,
		[project_id, user_id]
	)
	if (res.rowCount === 0) {
		throw new Error('Пользователь не имеет доступа к проекту')
	}
	return res.rows[0].role.toLowerCase()
}

const findByUserName = async userName => {
	try {
		const res = await pool.query('SELECT * FROM "User" WHERE name = $1', [
			userName,
		])

		return res.rows[0]
	} catch (e) {
		console.error(e)
		return null
	}
}


const findById = async userId => {
	try {
		const res = await pool.query('SELECT * FROM "User" WHERE user_id = $1', [
			userId,
		])
		return res.rows[0]
	} catch (e) {
		console.error(e)
		return null
	}
}

const createUser = async ({ username, email, password }) => {
	try {
		const res = await pool.query(
			`INSERT INTO "User" (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING *`,
			[username, email, password]
		)
		return res.rows[0]
	} catch (e) {
		console.error(e)
		return null
	}
}


module.exports = {
	findByUserName,
	findById,
	createUser,
	getUserRole,
}
