const express = require('express');
const router = express.Router();
const { getAllModules, upsertModules } = require('../controllers/module');

router.get('/', getAllModules);
router.post('/upsert', upsertModules);

module.exports = router;
