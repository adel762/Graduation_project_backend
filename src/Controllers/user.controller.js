import { registerUser, loginUser, oauthLogin, depositFunds } from '../Services/user.service.js';

// POST /api/users/register
export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ message: 'User registered successfully ✅', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// POST /api/users/login
export const login = async (req, res) => {
  try {
    const data = await loginUser(req.body);
    res.status(200).json({ message: 'Login successful ✅', ...data });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

// POST /api/users/oauth
export const oauth = async (req, res) => {
  try {
    const data = await oauthLogin(req.body);
    res.status(200).json({ message: 'OAuth login successful ✅', ...data });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// POST /api/users/deposit  (protected)
export const deposit = async (req, res) => {
  try {
    const { amount } = req.body;
    const result = await depositFunds(req.user.id, amount);
    res.status(200).json({ message: 'Deposit successful ✅', ...result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};