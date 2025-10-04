const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { asyncRouteHandler } = require('../utils/route.utils');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware('Admin'));

router.post('/add-user', asyncRouteHandler(adminController.addUser));
router.get('/fetch-users', asyncRouteHandler(adminController.fetchUsers));
router.get('/fetch-managers', asyncRouteHandler(adminController.fetchManagers));
router.post('/update-user/:id', asyncRouteHandler(adminController.updateUser));
router.post('/send-credentials/:id', asyncRouteHandler(adminController.sendCredentials));
router.get('/fetch-employees', asyncRouteHandler(adminController.fetchEmployees));
router.post('/add-rules', asyncRouteHandler(adminController.addRules));
router.get('/dashboard-stats', asyncRouteHandler(adminController.getDashboardStats));
router.get('/fetch-expenses', asyncRouteHandler(adminController.fetchExpenses));

module.exports = router;
