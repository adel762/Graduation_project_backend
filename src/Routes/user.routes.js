import express from 'express';
import { register, login } from '../Controllers/user.controller.js';
import { authenticateJWT } from "../middleware/auth.middleware.js";


const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Test
router.get("/test", authenticateJWT, (req, res) => {
    // req.user.email = "";
    res.json({
        message: "User profile",
        user: req.user,
    });
});

export default router;