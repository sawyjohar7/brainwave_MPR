const express = require('express');
const router = express.Router();
const client = require('../db');

// ✅ Get all students
router.get('/students', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM public.students ORDER BY roll_no');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Mark Attendance
router.post('/mark', async (req, res) => {
  const { student_id, date, status } = req.body;

  try {
    await client.query(
      `INSERT INTO public.attendance (student_id, date, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (student_id, date) DO UPDATE SET status = EXCLUDED.status`,
      [student_id, date, status]
    );

    res.json({ message: "✅ Attendance marked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get attendance list
router.get('/', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT s.roll_no, s.name, a.date, a.status
      FROM public.attendance a 
      JOIN public.students s ON s.roll_no = a.student_id
      ORDER BY a.date DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
