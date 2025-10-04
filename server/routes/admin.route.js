const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { asyncRouteHandler } = require('../utils/route.utils');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware('Admin'));

router.post('/add-user', asyncRouteHandler(adminController.addUser));
router.get('/fetch-managers', asyncRouteHandler(adminController.fetchManagers));

module.exports = router;
