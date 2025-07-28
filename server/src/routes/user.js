const express = require("express");
const { getUsers, createUser, login, getUserById, editUser, disableUser, updatePassword } = require('../controllers/user');

const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);
router.post("/login", login);
router.get("/:id", getUserById);
router.put('/:id', editUser);
router.put('/disable/:id', disableUser);
router.put('/password/:id', updatePassword);

module.exports = router;
