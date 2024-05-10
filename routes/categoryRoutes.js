const express = require("express");
const router = express.Router();
const { createCategory } = require("../controllers/Category");

router.post('/createCategory',createCategory);

module.exports = router;