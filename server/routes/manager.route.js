const express = require('express');
const router = express.Router();
const managerController = require('../controllers/manager.controller');
const { asyncRouteHandler } = require('../utils/route.utils');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware('Manager'));

router.get('/expense-logs', asyncRouteHandler(managerController.getExpense));
router.post('/accept-request', asyncRouteHandler(managerController.acceptRequest));
router.get('/profile', asyncRouteHandler(managerController.fetchInfo));

module.exports = router;
