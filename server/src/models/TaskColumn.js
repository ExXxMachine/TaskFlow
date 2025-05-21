const pool = require('../config/db')

const createTaskColumn = async ({ title, project_id }) => {
	try {
		const res = await pool.query(
			`INSERT INTO "TaskColumn" (title, project_id)
       VALUES ($1, $2)
       RETURNING *`,
			[title, project_id]
		)
		return res.rows[0]
	} catch (e) {
		console.error(e)
		return null
	}
}

const getTaskColumnByProjectId = async project_id => {
	try {
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
		return res.rows
	} catch (e) {
		console.error(e)
		return null
	}
}


const deleteTaskColumnById = async task_column_id => {
	try {
		await pool.query(`DELETE FROM "Task" WHERE task_column_id = $1`, [
			task_column_id,
		])

		await pool.query(`DELETE FROM "TaskColumn" WHERE task_column_id = $1`, [
			task_column_id,
		])

		return { success: true }
	} catch (e) {
		console.error(e)
		return null
	}
}


module.exports = {
	createTaskColumn,
	getTaskColumnByProjectId,
	deleteTaskColumnById,
}
