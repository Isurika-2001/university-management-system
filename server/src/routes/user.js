const express = require("express");
const { getUsers, createUser, login, getUserById } = require('../controllers/user');

const router = express.Router();

router.get("/", getUsers);
router.post("/", createUser);
router.post("/login", login);
router.get("/:id", getUserById);

module.exports = router;
