const jwt = require("jsonwebtoken")
require("dotenv").config();


exports.auth = (req, res, next) => {
    try {
        console.log(req.headers.cookie.replace("token=",""));
        const token = req.headers.cookie.replace("token=","")

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "token missing"
            })
        }

        // verify the token 
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);

            console.log(decode)

            req.user = decode;
        }
        catch (e) {
            return res.status(401).json({
                success: false,
                message: "token is invalid"
            })
        }

        next();
    }
    catch (err) {
        console.log(err)
        return res.status(401).json({
            success: false,
            message: "Something went wrong while verifying token"
        })
    }
}