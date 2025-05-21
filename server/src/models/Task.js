const pool = require('../config/db')

const createTask = async ({ taskColumnId, userId }) => {
	try {
		const res = await pool.query(
			`INSERT INTO "Task" (task_column_id, title,description, owner_id, priority)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
			[taskColumnId, 'Новое задание', 'Описание', userId, 0]
		)
		return res.rows[0]
	} catch (e) {
		console.error(e)
		return null
	}
}


module.exports = {
	createTask,	
}
