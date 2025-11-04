const db = require('../db');

exports.findByEmail = async (email) => {
  const [rows] = await db.query("SELECT * FROM teachers WHERE Email = ?", [email]);
  return rows[0];
};

exports.create = async (teacher) => {
  await db.query(
    "INSERT INTO teachers (Teacher_id, Name, Department, Email, Phone, password, isFirstLogin) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      teacher.Teacher_id,
      teacher.Name,
      teacher.Department,
      teacher.Email,
      teacher.Phone,
      teacher.password,
      teacher.isFirstLogin,
    ]
  );
  return exports.findByEmail(teacher.Email);
};

exports.updatePassword = async (email, password) => {
  await db.query("UPDATE teachers SET password = ?, isFirstLogin = 0 WHERE Email = ?", [password, email]);
};
