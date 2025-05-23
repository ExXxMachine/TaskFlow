const pool = require('../config/db')

const createProject = async ({ projectName, description, userId }) => {
	try {
		const res = await pool.query(
			`INSERT INTO "Project" (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
			[projectName, description, userId]
		)
		return res.rows[0]
	} catch (e) {
		console.error(e)
		return null
	}
}

const getProjectsByOwnerId = async ownerId => {
	try {
		const res = await pool.query(
			`SELECT * FROM "Project" WHERE owner_id = $1`,
			[ownerId]
		)
		return res.rows
	} catch (e) {
		console.error(e)
		return null
	}
}

const deleteProjectById = async project_id => {
	const client = await pool.connect()
	try {
		await client.query('BEGIN')

		await client.query(
			`
      DELETE FROM "Task"
      WHERE task_column_id IN (
        SELECT task_column_id FROM "TaskColumn" WHERE project_id = $1
      )
    `,
			[project_id]
		)

		await client.query(
			`
      DELETE FROM "TaskColumn"
      WHERE project_id = $1
    `,
			[project_id]
		)

		await client.query(
			`
      DELETE FROM "Project"
      WHERE project_id = $1
    `,
			[project_id]
		)

		await client.query('COMMIT')
		return true
	} catch (e) {
		await client.query('ROLLBACK')
		console.error('Ошибка при удалении проекта:', e)
		return false
	} finally {
		client.release()
	}
}

const updateProjectById = async (project_id, fieldsToUpdate) => {
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

		values.push(project_id)

		const query = `
      UPDATE "Project"
      SET ${setClauses.join(', ')}
      WHERE project_id = $${paramIndex}
      RETURNING *
    `

		const res = await pool.query(query, values)
		return { success: true, project: res.rows[0] }
	} catch (e) {
		console.error('Ошибка обновления проекта:', e)
		return { success: false, error: e }
	}
}

module.exports = {
	createProject,
	getProjectsByOwnerId,
	deleteProjectById,
	updateProjectById,
}
