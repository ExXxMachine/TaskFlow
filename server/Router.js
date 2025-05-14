const Router = require('express')
const router = new Router()

router.get('/', function (req, res) {
	res.sendfile('../index.html')
})

module.exports = router
