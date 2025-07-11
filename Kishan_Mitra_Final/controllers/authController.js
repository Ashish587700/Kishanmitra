const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.login = async (req, res) => {
  console.log("Login request body:", req.body); // <-- Add this
  const { email, password, userType } = req.body;

  const user = await User.findOne({ email,userType});
  console.log("user Details:", user); // <-- Add this
  
  if (!user) return res.status(401).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.status(401).json({ message: "Username and Password not match" });
   return res.json({ token: generateToken(user) });
  // Success logic...
};
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  console.log("SignUp request body:", req.body); // <-- Add this
  const { name, email, password, userType, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const user = await User.create({ name, email, password: hashedPassword, userType, role });

    res.json({ token: generateToken(user._id) });
  } catch (error) {
    res.status(400).json({ message: 'Registration failed', error });
  }
};



