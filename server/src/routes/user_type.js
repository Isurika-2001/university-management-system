const express = require("express");
const user_typeController = require("../controllers/user_type");

const router = express.Router();

router.get("/user_types", user_typeController.getUser_types);

module.exports = router;
