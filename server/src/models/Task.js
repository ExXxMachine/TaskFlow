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

const deleteTaskById = async task_id => {
	try {
		console.log('task_id:', task_id)
		await pool.query(`DELETE FROM "Task" WHERE task_id = $1`, [task_id])
		return { success: true }
	} catch (e) {
		console.error(e)
		return null
	}
}

const updateTaskById = async (task_id, fieldsToUpdate) => {
	try {
		const setClauses = []
		const values = []
		let paramIndex = 1

		for (const [key, value] of Object.entries(fieldsToUpdate)) {
			if (value !== undefined && value !== null) {
				setClauses.push(`"${key}" = $${paramIndex}`)
				values.push(value)
				paramIndex++
			}
		}

		if (setClauses.length === 0) {
			return { success: false, message: 'No fields to update' }
		}

		values.push(task_id)

		const query = `
      UPDATE "Task"
      SET ${setClauses.join(', ')}
      WHERE task_id = $${paramIndex}
      RETURNING *
    `

		const res = await pool.query(query, values)
		return { success: true, task: res.rows[0] }
	} catch (e) {
		console.error('Ошибка обновления задачи:', e)
		return { success: false, error: e }
	}
}


module.exports = {
	createTask,
	deleteTaskById,
	updateTaskById
}
