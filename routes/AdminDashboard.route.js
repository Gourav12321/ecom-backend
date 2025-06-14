const express = require('express');
const { getDashboardData } = require('../controller/AdminDashboard');
const adminMiddleware = require('../middleware/adminMiddleware');
const router = express.Router();

router.get('/dashboard',adminMiddleware, getDashboardData);

module.exports = router;
