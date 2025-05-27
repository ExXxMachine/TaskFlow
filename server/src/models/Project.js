const pool = require('../config/db')
const User = require('./User')

const createProject = async ({ projectName, description, userId }) => {
	const client = await pool.connect()

	try {
		await client.query('BEGIN')
		const resProject = await client.query(
			`INSERT INTO "Project" (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
			[projectName, description, userId]
		)
		const project = resProject.rows[0]
		await client.query(
			`INSERT INTO "AccessList" (project_id, user_id, role)
       VALUES ($1, $2, $3)`,
			[project.project_id, userId, 'owner']
		)

		await client.query('COMMIT')

		return project
	} catch (e) {
		await client.query('ROLLBACK')
		console.error('Ошибка создания проекта с AccessList:', e)
		return null
	} finally {
		client.release()
	}
}

const getProjectsByUserId = async userId => {
	try {
		const res = await pool.query(
			`
      SELECT p.*
      FROM "Project" p
      JOIN "AccessList" a ON p.project_id = a.project_id
      WHERE a.user_id = $1
      `,
			[userId]
		)
		return res.rows
	} catch (e) {
		console.error('Ошибка получения проектов пользователя:', e)
		return null
	}
}

const deleteProjectById = async (project_id, user_id) => {
	const client = await pool.connect()

	try {
		await client.query('BEGIN')

		const role = await User.getUserRole(project_id, user_id)
		if (!role) {
			throw new Error('Нет доступа к проекту')
		}
		if (role !== 'owner' && role !== 'creator') {
			throw new Error('Недостаточно прав для удаления проекта')
		}

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
      DELETE FROM "AccessList"
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
		return { success: true }
	} catch (e) {
		await client.query('ROLLBACK')
		console.error('Ошибка при удалении проекта:', e)
		return { success: false, message: e.message }
	} finally {
		client.release()
	}
}

const updateProjectById = async (project_id, fieldsToUpdate, user_id) => {
	try {
		const role = await User.getUserRole(project_id, user_id)
		if (!role) {
			return { success: false, message: 'Нет доступа к проекту' }
		}
		if (role !== 'owner' && role !== 'creator') {
			return {
				success: false,
				message: 'Недостаточно прав для обновления проекта',
			}
		}

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
	getProjectsByUserId,
	deleteProjectById,
	updateProjectById,
}