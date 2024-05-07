const express = require("express");
const { getUsers, createUser, login, getUserById } = require('../controllers/user');

const router = express.Router();

router.get("/users", getUsers);
router.post("/user", createUser);
router.post("/login", login);
router.get("/users/:id", getUserById);

module.exports = router;
