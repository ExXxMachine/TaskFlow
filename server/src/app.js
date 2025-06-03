const express = require('express')
const pool = require('./config/db')
const authRouter = require('./routes/authRouter')
const projectRouter = require('./routes/projectRouter')
const inviteRouter = require('./routes/inviteRouter')

const app = express()
const cors = require('cors')
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors())

app.use('/auth', authRouter)
app.use('/projects', projectRouter)
app.use('/invite', inviteRouter)

app.get('/users', async (req, res) => {
	try {
		const result = await pool.query('select * from "Users"')
		res.json(result.rows)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
