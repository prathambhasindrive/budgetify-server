const express = require("express");
const router = express.Router();
const { createCategory } = require("../controllers/Category");
const { auth } = require("../middlewares/auth");


router.post('/createCategory',auth,createCategory);

module.exports = router;