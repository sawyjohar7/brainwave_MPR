const db = require('../db');

// Get student by College_id (for login)
exports.findByCollegeId = async (college_id) => {
  const res = await db.query("SELECT * FROM students WHERE college_id = $1", [college_id]);
  return res.rows[0];
};

// Add new student
exports.create = async (student) => {
  await db.query(
    `INSERT INTO students 
    (roll_no, name, course, shift, section, college_id, year, email, password, isFirstLogin) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      student.Roll_no,
      student.Name,
      student.Course,
      student.Shift,
      student.Section,
      student.College_id,
      student.Year,
      student.email,
      student.password,
      student.isFirstLogin,
    ]
  );
  return exports.findByCollegeId(student.College_id);
};

// Update password
exports.updatePassword = async (college_id, password) => {
  await db.query(
    "UPDATE students SET password = $1, isFirstLogin = false WHERE college_id = $2",
    [password, college_id]
  );
};
