const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { asyncRouteHandler } = require('../utils/route.utils');
const { upload } = require('../utils/multer.utils');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware('Employee'));

router.post(
	'/submit-expense',
	upload.single('receipt'),
	asyncRouteHandler(employeeController.addExpense)
);
router.get('/fetch-expenses', asyncRouteHandler(employeeController.fetchExpenses));

module.exports = router;
