const express = require("express");
const router = express.Router();

const {
  sendOTP,
  signup,
  login,
  resetPassword,
  resetPasswordThroughLink,
  logout,
} = require("../controllers/Auth");
const { auth } = require("../middlewares/auth");

router.post("/sendOTP", sendOTP);
router.post("/signup", signup);
router.post("/login", login);
router.post("/resetPassword", resetPassword);
router.post("/update-password/:token", resetPasswordThroughLink);
router.post('/logout',auth,logout  )

router.get("/auth", auth, (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "You are authenticated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
