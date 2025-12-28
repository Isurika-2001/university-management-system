const express = require('express');
const router = express.Router();
const { getAllModules, upsertModules } = require('../controllers/module');
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

router.get('/', authenticate, checkPermission('modules', 'read'), getAllModules);
router.post('/upsert', authenticate, checkPermission('modules', 'update'), upsertModules);

module.exports = router;
