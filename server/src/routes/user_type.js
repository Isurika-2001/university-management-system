const express = require('express');
const user_typeController = require('../controllers/user_type');
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();

router.get("/", authenticate, checkPermission('user', 'read'), user_typeController.getUser_types);

module.exports = router;
