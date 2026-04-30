import User from '../Models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";


export const registerUser = async (data) => {
  const { username, email, password } = data;

  // تشفير الباسورد
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  return user;
};

export const loginUser = async (data) => {
  const { email, password } = data;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error('User not found');
  } else {
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error('Invalid password');
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    return { user: { username: user.username, email: user.email }, token };
  }
};