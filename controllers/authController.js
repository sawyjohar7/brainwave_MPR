const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");

// ✅ Generate JWT
const generateToken = (user, role) => {
  return jwt.sign(
    {
      id: user.College_id || user.college_id || user.Teacher_id,
      email: user.Email || user.email,
      role,
      isFirstLogin: !!user.isFirstLogin,
    },
    process.env.JWT_SECRET || "fallback_secret",
    { expiresIn: "30d" }
  );
};

// ✅ SIGNUP (unchanged from previous logic)
exports.signup = async (req, res) => {
  const { fullName, email, password, role, rollNo, collegeId, department, teacherId } = req.body;

  try {
    if (role === "student") {
      let existing = await Student.findByCollegeId(collegeId);
      if (existing) return res.status(400).json({ message: "Student already exists." });

      let newStudent = {
        Roll_no: rollNo,
        Name: fullName,
        Course: "",
        Shift: "",
        Section: "",
        College_id: collegeId,
        Year: "",
        email,
        password,  // not used for login
        isFirstLogin: 0,
      };

      await Student.create(newStudent);
      let user = await Student.findByCollegeId(collegeId);
      let token = generateToken(user, "student");

      return res.status(201).json({
        message: "Student account created",
        token,
        user: { ...user, role: "student", isFirstLogin: false },
      });
    }

    if (role === "teacher") {
      let existing = await Teacher.findByEmail(email);
      if (existing) return res.status(400).json({ message: "Teacher already exists." });

      let newTeacher = {
        Teacher_id: teacherId || "T" + Date.now(),
        Name: fullName,
        Department: department || "",
        Email: email,
        Phone: "",
        password, // not used for login
        isFirstLogin: 0,
      };

      await Teacher.create(newTeacher);
      let user = await Teacher.findByEmail(email);
      let token = generateToken(user, "teacher");

      return res.status(201).json({
        message: "Teacher account created",
        token,
        user: { ...user, role: "teacher", isFirstLogin: false },
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ ✅ ✅ LOGIN — roll_no / teacher_id based
exports.login = async (req, res) => {
  let { identifier, password, role } = req.body;

  try {
    let user;

    // ✅ STUDENT LOGIN
    if (role === "student") {
      user = await Student.findByCollegeId(identifier);

      if (!user) {
        return res.status(400).json({ message: "Student not found" });
      }

      const roll = String(user.Roll_no || user.roll_no).trim();
      const pass = String(password).trim();

      if (roll !== pass) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    }

    // ✅ TEACHER LOGIN
    else if (role === "teacher") {
      user = await Teacher.findByEmail(identifier);

      if (!user) {
        return res.status(400).json({ message: "Teacher not found" });
      }

      const teacherID = String(user.Teacher_id || user.teacher_id).trim();
      const pass = String(password).trim();

      if (teacherID !== pass) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
    }

    // ✅ Invalid role
    else {
      return res.status(400).json({ message: "Invalid role" });
    }

    const token = generateToken(user, role);

    return res.json({
      message: "Login successful",
      token,
      user: { ...user, role, isFirstLogin: !!user.isFirstLogin },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Change Password (disabled, because roll_no & teacher_id are password)
exports.changePassword = async (req, res) => {
  return res.json({ message: "Change password disabled (Roll_no / Teacher_id used as password)" });
};