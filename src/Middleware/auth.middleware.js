import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const authenticateJWT = async (req, res, next) => {
    try {
    // 1. get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
            message: "No token provided",
        });
    }

    const token = authHeader.split(" ")[1];

    // 2. verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. find user from DB (important for security)
    const user = await User.findByPk(decoded.id);

    if (!user) {
        return res.status(401).json({
            message: "User not found",
        });
    }

    // 4. attach user to request
    req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
    };

    next();
    } catch (error) {
        return res.status(401).json({
        message: "Invalid or expired token",
        });
    }
};