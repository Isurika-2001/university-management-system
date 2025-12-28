const express = require('express');
const { getUsers, createUser, login, getUserById, editUser, disableUser, updatePassword, enableUser } = require('../controllers/user');
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();

router.get('/', authenticate, checkPermission('user', 'read'), getUsers);
router.post('/', authenticate, checkPermission('user', 'create'), createUser);
router.post('/login', login);
router.get('/:id', authenticate, checkPermission('user', 'read'), getUserById);
router.put('/:id', authenticate, checkPermission('user', 'update'), editUser);
router.put('/disable/:id', authenticate, checkPermission('user', 'update'), disableUser);
router.put('/enable/:id', authenticate, checkPermission('user', 'update'), enableUser);
router.put('/password/:id', authenticate, checkPermission('user', 'update'), updatePassword);

module.exports = router;

