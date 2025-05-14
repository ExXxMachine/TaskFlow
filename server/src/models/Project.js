const pool = require('../config/db')

const createProject = async({ projectName, description, userId}) => {
  try{
    const res = await pool.query(
			`INSERT INTO "Project" (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
			[projectName, description, userId]
		)
    return res.rows[0]
  }catch(e){
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

module.exports = {
  createProject,
  getProjectsByOwnerId
}