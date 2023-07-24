
const user_model = require("../models/User_Models.js")
const jwt = require("jsonwebtoken");


exports.isAuthenticated = async (req, res, next) => {

    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({
                message: "Please Login First"
            });
        }

        const decoded = await jwt.verify(token, process.env.SECRET_KEY);
        

        req.user = await user_model.findById(decoded._id);

        next()
    } catch (error) {
        res.status(500).json({
            message:error.message,
        })

    }
}