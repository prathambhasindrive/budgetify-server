const User = require("../models/User");
const bcrypt = require("bcrypt");
const validator = require("validator");
const otpGenerator = require("otp-generator");
const Otp = require("../models/otp");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const mailSender = require("../utils/mailSender");

//Generate and save otp
exports.sendOTP = async (req, res) => {
  try {
    console.log(req.body);

    const { email, password, confirmPassword, firstname, lastname } = req.body;
    // validate inputs
    if (!email || !firstname || !confirmPassword || !lastname || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields..",
      });
    }

    if (confirmPassword !== password) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a Strong Password",
      });
    }
    const checkUser = await User.findOne({ email });

    if (checkUser) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }

    //generate otp
    var otp = otpGenerator.generate(6, {
      digits: 6,
      specialChars: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
    });

    console.log("OTP generated : " + otp);

    //check unique otp or not
    const result = await Otp.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        digits: 6,
        specialChars: false,
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
      });
      result = await Otp.findOne({ otp: otp });
    }

    const otpPayload = { email, otp }; // creating otp entry in db

    const otpBody = await Otp.create(otpPayload);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp: otp,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Message from sendOTP controller : " + error.message,
    });
  }
};

// signup controller
exports.signup = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password, confirmPassword, firstname, lastname, otp } =
      req.body;

    // validate inputs
    if (!email || !firstname || !confirmPassword || !lastname || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    if (confirmPassword !== password) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a Strong Password",
      });
    }

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please Login.",
      });
    }

    //check recent otp

    const recentotp = await Otp.findOne({ email: email })
      .sort({ createdAt: -1 })
      .limit(1);

    console.log("recentOTP from database : ",recentotp);

    // vaidate otp

    if (recentotp.lenght == 0 || recentotp == null) {
      // Otp not found
      return res.status(400).json({
        success: false,
        message: "OTP Doesn't Exists.",
      });
    } else if (otp !== recentotp.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // hash the password and validate it
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error in hashing password : " + error.message,
      });
    }

    // create a new user
    const newUser = new User({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      imgUrl: `https://api.dicebear.com/8.x/initials/svg?seed=${firstname} ${lastname}?radius=50`,
    });

    // save the user
    const savedUser = await newUser.save();
    if (!savedUser) {
      return res.status(400).json({
        success: false,
        message: "User not saved",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User saved successfully",
      user: savedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error : " + error.message,
    });
  }
};

// login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // check if user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    // check if password is correct
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    //create payload object
    const payload = {
      id: existingUser.id,
      email: existingUser.email,
      firstname: existingUser.firstname,
      lastname: existingUser.lastname,
    };

    //create token
    let token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    existingUser.token = token;
    existingUser.password = undefined;

    //options
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    //send in cookie
    res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      existingUser,
      message: "User logged in successfully",
    });
    console.log("User logged in successfully", existingUser );
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error || Error in logging in : " + error.message,
    });
  }
};

// send reset password token request
exports.resetPassword = async (req, res) => {
  try {
    // get the user from req.body
    console.log(req.body)
    const { email } = req.body;

    // check if the user exists
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User does not exist. Please Signup",
      });
    }

    // create token

    const token = crypto.randomUUID();
    console.log(token);
    // update the user

    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        token: token,
        resetPasswordExpiresIn: Date.now() +  60 * 1000,
      },
      { new: true }
    );

    const url = `http:localhost:3000/update-password/${token}`;

    const mailResponse = await mailSender(email, "Reset Password Link", url);

    if (!mailResponse) {
      return res.status(400).json({
        success: false,
        message: "Mail not sent",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Mail sent successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error || Error in Resetting Password : " +
        error.message,
    });
  }
};

// reset password through email link
exports.resetPasswordThroughLink = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    //validate the data
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields",
      });
    }

    // check both the passwords are same
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // check if the token is valid
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid Token",
      });
    }

    // check if the token is expired
    if (user.resetPasswordExpiresIn < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Token Expired",
      });
    }

    // hash the password and validate it
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error in hashing password : " + error.message,
      });
    }

    // update the user
    const updatedUser = await User.findOneAndUpdate(
      { token },
      {
        password: hashedPassword,
        resetPasswordExpiresIn: undefined,
        token: undefined,
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error || Error in Resetting Password : " +
        error.message,
    });
  }
};


exports.logout = async (req, res) => { 
  try {
    const token = req.user.token;
    res.clearCookie('token');
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message:
        "Internal Server Error || Error in logging out : " + error.message,
    });
    
  }
 };