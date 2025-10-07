import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const PORT = 8181;

app.use(cors({
  origin: ['https://tsvrottrainer.azurewebsites.net', 'https://trainer.tsvrot.de', 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174']
}));
app.use(express.json());

const pool = mysql.createPool({
  host: 'tsvrot2025-server.mysql.database.azure.com',
  user: 'rarsmzerix',
  password: 'HalloTSVRot2025',
  database: 'tsvrot2025-database',
  port: 3306,
  ssl: { rejectUnauthorized: false }
});

// Test DB Connection
pool.getConnection()
  .then(c => { 
    console.log('✅ DB VERBUNDEN: tsvrot2025-database'); 
    c.release(); 
  })
  .catch(e => console.log('❌ DB FEHLER:', e.message));

// HEALTH CHECK
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', database: 'Connected' });
  } catch (e) {
    res.json({ status: 'OK', database: 'Error: ' + e.message });
  }
});

// TRAINERS
app.get('/api/trainers', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM trainers');
    res.json(rows);
  } catch (e) {
    console.error('Error fetching trainers:', e);
    res.json([]);
  }
});

app.post('/api/trainers', async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO trainers (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)',
      [firstName, lastName, email, phone]
    );
    res.json({ id: result.insertId, firstName, lastName, email, phone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// COURSES
app.get('/api/courses', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM courses');
    res.json(rows);
  } catch (e) {
    console.error('Error fetching courses:', e);
    res.json([]);
  }
});

app.post('/api/courses', async (req, res) => {
  const { name, dayOfWeek, startTime, endTime, location } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO courses (name, day_of_week, start_time, end_time, location) VALUES (?, ?, ?, ?, ?)',
      [name, dayOfWeek, startTime, endTime, location]
    );
    res.json({ id: result.insertId, name, dayOfWeek, startTime, endTime, location });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WEEKLY ASSIGNMENTS
app.get('/api/weekly-assignments', async (req, res) => {
  const { courseId, weekNumber, year } = req.query;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM weekly_assignments WHERE course_id = ? AND week_number = ? AND year = ?',
      [courseId, weekNumber, year]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.json([]);
  }
});

app.post('/api/weekly-assignments', async (req, res) => {
  const { course_id, week_number, year, trainer_ids } = req.body;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Erst alte löschen
    await connection.query(
      'DELETE FROM weekly_assignments WHERE course_id = ? AND week_number = ? AND year = ?',
      [course_id, week_number, year]
    );
    
    // Dann neue einfügen
    if (trainer_ids && trainer_ids.length > 0) {
      for (const trainer_id of trainer_ids) {
        await connection.query(
          'INSERT INTO weekly_assignments (course_id, week_number, year, trainer_id) VALUES (?, ?, ?, ?)',
          [course_id, week_number, year, trainer_id]
        );
      }
    }
    
    await connection.commit();
    res.json({ message: 'Assignments updated', count: trainer_ids ? trainer_ids.length : 0 });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating assignments:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// CANCELLED COURSES - WICHTIG!
app.get('/api/cancelled-courses', async (req, res) => {
  const { courseId, weekNumber, year } = req.query;
  try {
    if (courseId && weekNumber && year) {
      const [rows] = await pool.query(
        'SELECT * FROM cancelled_courses WHERE course_id = ? AND week_number = ? AND year = ?',
        [courseId, weekNumber, year]
      );
      res.json(rows);
    } else {
      const [rows] = await pool.query('SELECT * FROM cancelled_courses');
      res.json(rows);
    }
  } catch (error) {
    console.error('Error fetching cancelled courses:', error);
    res.json([]);
  }
});

app.post('/api/cancelled-courses', async (req, res) => {
  const { course_id, week_number, year, reason } = req.body;
  
  try {
    const [result] = await pool.query(
      'INSERT INTO cancelled_courses (course_id, week_number, year, reason) VALUES (?, ?, ?, ?) ' +
      'ON DUPLICATE KEY UPDATE reason = VALUES(reason)',
      [course_id, week_number, year, reason || 'Sonstiges']
    );
    console.log('Course cancelled:', { course_id, week_number, year });
    res.json({ message: 'Course cancelled', insertId: result.insertId });
  } catch (error) {
    console.error('Error cancelling course:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/cancelled-courses', async (req, res) => {
  const { course_id, week_number, year } = req.query;
  
  try {
    const [result] = await pool.query(
      'DELETE FROM cancelled_courses WHERE course_id = ? AND week_number = ? AND year = ?',
      [course_id, week_number, year]
    );
    console.log('Course reactivated:', { course_id, week_number, year });
    res.json({ message: 'Course reactivated', deleted: result.affectedRows });
  } catch (error) {
    console.error('Error reactivating course:', error);
    res.status(500).json({ error: error.message });
  }
});

// HOLIDAY WEEKS
app.get('/api/holiday-weeks', async (req, res) => {
  const { weekNumber, year } = req.query;
  try {
    if (weekNumber && year) {
      const [rows] = await pool.query(
        'SELECT * FROM holiday_weeks WHERE week_number = ? AND year = ?',
        [weekNumber, year]
      );
      res.json(rows);
    } else {
      const [rows] = await pool.query('SELECT * FROM holiday_weeks');
      res.json(rows);
    }
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.json([]);
  }
});

app.post('/api/holiday-weeks', async (req, res) => {
  const { week_number, year } = req.body;
  
  try {
    const [result] = await pool.query(
      'INSERT INTO holiday_weeks (week_number, year) VALUES (?, ?) ' +
      'ON DUPLICATE KEY UPDATE week_number = VALUES(week_number)',
      [week_number, year]
    );
    res.json({ message: 'Holiday week added', insertId: result.insertId });
  } catch (error) {
    console.error('Error adding holiday:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/holiday-weeks', async (req, res) => {
  const { week_number, year } = req.query;
  
  try {
    const [result] = await pool.query(
      'DELETE FROM holiday_weeks WHERE week_number = ? AND year = ?',
      [week_number, year]
    );
    res.json({ message: 'Holiday week removed', deleted: result.affectedRows });
  } catch (error) {
    console.error('Error removing holiday:', error);
    res.status(500).json({ error: error.message });
  }
});

// TEST ENDPOINT
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server läuft!', port: PORT });
});

app.listen(PORT, () => {
  console.log(`✅ SERVER LÄUFT: http://localhost:${PORT}`);
  console.log(`✅ TEST: http://localhost:${PORT}/api/test`);
});