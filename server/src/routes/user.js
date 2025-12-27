const express = require("express");
const { getUsers, createUser, login, getUserById, editUser, disableUser, updatePassword, enableUser } = require('../controllers/user');
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();

router.get("/", authenticate, checkPermission('users', 'read'), getUsers);
router.post("/", authenticate, checkPermission('users', 'create'), createUser);
router.post("/login", login);
router.get("/:id", authenticate, checkPermission('users', 'read'), getUserById);
router.put('/:id', authenticate, checkPermission('users', 'update'), editUser);
router.put('/disable/:id', authenticate, checkPermission('users', 'update'), disableUser);
router.put('/enable/:id', authenticate, checkPermission('users', 'update'), enableUser);
router.put('/password/:id', authenticate, checkPermission('users', 'update'), updatePassword);

module.exports = router;

