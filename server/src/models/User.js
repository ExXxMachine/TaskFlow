const pool = require('../config/db') 

const findByUserName = async userName => {
	try {
		const res = await pool.query('SELECT * FROM "User" WHERE name = $1', [
			userName,
		])
   console.log('findByUserName:', res.rows[0])

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
}
