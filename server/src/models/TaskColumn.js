const pool = require('../config/db')
const User = require('./User')

const createTaskColumn = async ({ title, project_id, userId }) => {
	try {
		const role = await User.getUserRole(project_id, userId)
		if (role !== 'owner') {
			throw new Error('Нет прав на создание столбца')
		}

		const res = await pool.query(
			`INSERT INTO "TaskColumn" (title, project_id)
       VALUES ($1, $2)
       RETURNING *`,
			[title, project_id]
		)
		return res.rows[0]
	} catch (e) {
		console.error(e)
		return { success: false, message: e.message }
	}
}

const getTaskColumnByProjectId = async (project_id, user_id) => {
	try {
		// Получаем роль 
		const role = await User.getUserRole(project_id, user_id)
		// Получаем колонки с задачами
		const res = await pool.query(
			`SELECT
        tc.task_column_id,
        tc.title,
        tc.project_id,
        COALESCE(
          json_agg(
            json_build_object(
              'task_id', t.task_id,
              'task_column_id', t.task_column_id,
              'title', t.title,
							'task_description', t.task_description,
              'priority', t.priority,
              'executor_id', t.executor_id,
              'owner_id', t.owner_id
            )
          ) FILTER (WHERE t.task_id IS NOT NULL), '[]'
        ) AS tasks
      FROM "TaskColumn" tc
      LEFT JOIN "Task" t ON t.task_column_id = tc.task_column_id
      WHERE tc.project_id = $1
      GROUP BY tc.task_column_id, tc.title, tc.project_id
      ORDER BY tc.task_column_id`,
			[project_id]
		)

		return {
			success: true,
			role, 
			columns: res.rows,
		}
	} catch (e) {
		console.error(e)
		return { success: false, message: e.message }
	}
}

const deleteTaskColumnById = async (task_column_id, user_id) => {
	try {
		const res = await pool.query(
			`SELECT project_id FROM "TaskColumn" WHERE task_column_id = $1`,
			[task_column_id]
		)
		if (res.rowCount === 0) {
			return { success: false, message: 'Столбец не найден' }
		}
		const project_id = res.rows[0].project_id

		const role = await User.getUserRole(project_id, user_id)
		if (role !== 'owner') {
			throw new Error('Нет прав на удаление столбца')
		}

		await pool.query(`DELETE FROM "Task" WHERE task_column_id = $1`, [
			task_column_id,
		])

		await pool.query(`DELETE FROM "TaskColumn" WHERE task_column_id = $1`, [
			task_column_id,
		])

		return { success: true }
	} catch (e) {
		console.error(e)
		return { success: false, message: e.message }
	}
}

const updateTaskColumnById = async (task_column_id, title, user_id) => {
	try {
		const res = await pool.query(
			`SELECT project_id FROM "TaskColumn" WHERE task_column_id = $1`,
			[task_column_id]
		)
		if (res.rowCount === 0) {
			return { success: false, message: 'Столбец не найден' }
		}
		const project_id = res.rows[0].project_id

		const role = await User.getUserRole(project_id, user_id)
		if (role !== 'owner') {
			throw new Error('Нет прав на обновление столбца')
		}

		const query = `
      UPDATE "TaskColumn"
      SET title = $1
      WHERE task_column_id = $2
      RETURNING *
    `
		const resUpdate = await pool.query(query, [title, task_column_id])
		return { success: true, taskColumn: resUpdate.rows[0] }
	} catch (e) {
		console.error('Ошибка обновления названия столбца:', e)
		return { success: false, message: e.message }
	}
}

module.exports = {
	createTaskColumn,
	getTaskColumnByProjectId,
	deleteTaskColumnById,
	updateTaskColumnById,
}
