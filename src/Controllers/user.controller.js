import { registerUser, loginUser } from '../Services/user.service.js';

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      message: 'User created ✅',
      user,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error ❌',
      error: err.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const data = await loginUser(req.body);
    res.status(200).json({
      message: 'User logged in ✅',
      data,
    });
  } catch (err) {
    res.status(401).json({
      message: 'Login failed ❌',
      error: err.message,
    });
  }
};