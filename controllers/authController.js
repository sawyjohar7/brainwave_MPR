const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

// Helper: Generate JWT
const generateToken = (user, role) => {
  return jwt.sign(
    { id: user.College_id || user.Teacher_id, email: user.email || user.Email, role, isFirstLogin: !!user.isFirstLogin },
    process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' }
  );
};

// SIGNUP - For new accounts
exports.signup = async (req, res) => {
  const { fullName, email, password, role, rollNo, collegeId, department, teacherId } = req.body;

  try {
    if (role === 'student') {
      let existing = await Student.findByCollegeId(collegeId);
      if (existing) return res.status(400).json({ message: 'Student already exists.' });

      let hashedPassword = await bcrypt.hash(password, 12);
      let newStudent = {
        Roll_no: rollNo, Name: fullName, Course: '', Shift: '', Section: '', College_id: collegeId, Year: '', email, password: hashedPassword, isFirstLogin: 0,
      };

      await Student.create(newStudent);
      let user = await Student.findByCollegeId(collegeId);
      let token = generateToken(user, 'student');
      return res.status(201).json({ message: 'Student account created', token, user: { ...user, role: 'student', isFirstLogin: false } });
    } else if (role === 'teacher') {
      let existing = await Teacher.findByEmail(email);
      if (existing) return res.status(400).json({ message: 'Teacher already exists.' });

      let hashedPassword = await bcrypt.hash(password, 12);
      let newTeacher = {
        Teacher_id: teacherId || "T" + Date.now(),
        Name: fullName,
        Department: department || '',
        Email: email,
        Phone: '',
        password: hashedPassword,
        isFirstLogin: 0,
      };

      await Teacher.create(newTeacher);
      let user = await Teacher.findByEmail(email);
      let token = generateToken(user, 'teacher');
      return res.status(201).json({ message: 'Teacher account created', token, user: { ...user, role: 'teacher', isFirstLogin: false } });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { identifier, password, role } = req.body;
  try {
    let user;
    if (role === 'student') user = await Student.findByCollegeId(identifier);
    else if (role === 'teacher') user = await Teacher.findByEmail(identifier);

    if (!user) return res.status(400).json({ message: 'User not found' });
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    let token = generateToken(user, role);
    return res.json({ message: 'Login successful', token, user: { ...user, role, isFirstLogin: !!user.isFirstLogin } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    let user;
    if (decoded.role === 'student') user = await Student.findByCollegeId(decoded.id);
    else user = await Teacher.findByEmail(decoded.email);

    if (!user) return res.status(404).json({ message: 'User not found' });
    let isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect old password' });
    let hashed = await bcrypt.hash(newPassword, 12);

    if (decoded.role === 'student') await Student.updatePassword(user.College_id, hashed);
    else await Teacher.updatePassword(user.Email, hashed);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


/*const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const users = require('../models/userModel');

// Signup controller
exports.signup = async (req, res) => {
  const { email, password, name } = req.body;
  
  console.log("Signup attempt:", email, name);
  
  // Validate MSI email domain
  if (!email.endsWith('@msijanakpuri.com')) {
    return res.status(400).json({ 
      message: 'Email must end with @msijanakpuri.com' 
    });
  }
  
  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      name
    };
    
    users.push(newUser);
    
    // Create token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '1h' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: newUser.id, email: newUser.email, name: newUser.name }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login controller
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  console.log("Login attempt:", email);
  
  // Check if user exists
  const user = users.find(u => u.email === email);
  if (!user) {
    console.log("❌ User not found");
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  
  console.log("✅ User found:", user.email);
  
  try {
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Password match result:", isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email }, 
      process.env.JWT_SECRET || 'fallback_secret', 
      { expiresIn: '1h' }
    );
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
*/