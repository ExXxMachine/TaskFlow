const pool = require('../config/db')
const User = require('./User')
const createTask = async ({ taskColumnId, userId }) => {
	try {
		const resColumn = await pool.query(
			`SELECT project_id FROM "TaskColumn" WHERE task_column_id = $1`,
			[taskColumnId]
		)
		if (resColumn.rowCount === 0) {
			return { success: false, message: 'Столбец не найден' }
		}
		const project_id = resColumn.rows[0].project_id

		const role = await User.getUserRole(project_id, userId)
		if (role !== 'owner') {
			throw new Error('Нет прав на создание задачи')
		}

		const res = await pool.query(
			`INSERT INTO "Task" (task_column_id, title, task_description, owner_id, priority)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
			[taskColumnId, 'Новое задание', 'Описание', userId, 0]
		)
		return { success: true, task: res.rows[0] }
	} catch (e) {
		console.error(e)
		return { success: false, message: e.message }
	}
}

const deleteTaskById = async (task_id, userId) => {
	try {
		// Получаем project_id через task → task_column
		const resTask = await pool.query(
			`SELECT tc.project_id FROM "Task" t
       JOIN "TaskColumn" tc ON t.task_column_id = tc.task_column_id
       WHERE t.task_id = $1`,
			[task_id]
		)
		if (resTask.rowCount === 0) {
			return { success: false, message: 'Задача не найдена' }
		}
		const project_id = resTask.rows[0].project_id

		const role = await User.getUserRole(project_id, userId)
		if (role !== 'owner') {
			throw new Error('Нет прав на удаление задачи')
		}

		await pool.query(`DELETE FROM "Task" WHERE task_id = $1`, [task_id])
		return { success: true }
	} catch (e) {
		console.error(e)
		return { success: false, message: e.message }
	}
}

const updateTaskById = async (task_id, fieldsToUpdate, userId) => {
	console.log('task_id', task_id)
	console.log('fieldsToUpdate', fieldsToUpdate)
	console.log('userId', userId)

	try {
		const resTask = await pool.query(
			`SELECT tc.project_id FROM "Task" t
       JOIN "TaskColumn" tc ON t.task_column_id = tc.task_column_id
       WHERE t.task_id = $1`,
			[task_id]
		)
		if (resTask.rowCount === 0) {
			return { success: false, message: 'Задача не найдена' }
		}
		const project_id = resTask.rows[0].project_id

		const role = await User.getUserRole(project_id, userId)

		// Удаляем поля с undefined или null
		const cleanedFields = {}
		for (const [key, value] of Object.entries(fieldsToUpdate)) {
			if (value !== undefined && value !== null) {
				cleanedFields[key] = value
			}
		}

		// Разрешённые поля для не владельца
		const allowedFieldsForNonOwner = ['task_column_id']

		let fieldsToActuallyUpdate = {}

		if (role === 'owner') {
			// Владелец может обновлять все поля
			fieldsToActuallyUpdate = cleanedFields
		} else {
			// Не владелец — фильтруем поля, разрешая только task_column_id
			for (const key of Object.keys(cleanedFields)) {
				if (allowedFieldsForNonOwner.includes(key)) {
					fieldsToActuallyUpdate[key] = cleanedFields[key]
				}
			}
			if (Object.keys(fieldsToActuallyUpdate).length === 0) {
				return {
					success: false,
					message: 'Нет прав на обновление выбранных полей',
				}
			}
		}

		const setClauses = []
		const values = []
		let paramIndex = 1

		for (const [key, value] of Object.entries(fieldsToActuallyUpdate)) {
			setClauses.push(`"${key}" = $${paramIndex}`)
			values.push(value)
			paramIndex++
		}

		if (setClauses.length === 0) {
			return { success: false, message: 'Нет полей для обновления' }
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
		return { success: false, message: e.message }
	}
}
	
module.exports = {
	createTask,
	deleteTaskById,
	updateTaskById,
}
