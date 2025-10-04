const express = require('express');
const router = express.Router();
const managerController = require('../controllers/manager.controller');
const { asyncRouteHandler } = require('../utils/route.utils');

router.get('/expense-logs', asyncRouteHandler(managerController.getExpense));

module.exports = router;
