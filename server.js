const path = require('path');
const express = require('express');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'data', 'registrations.db');

let db;

function getDb() {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new Database(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        birthdate TEXT NOT NULL,
        category TEXT NOT NULL,
        dinner TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now', 'localtime'))
      )
    `);
  }
  return db;
}

function initDb() {
  getDb();
  console.log('DB initialized at', DB_PATH);
}

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/registrations', function (req, res) {
  const { name, birthdate, category, dinner, message } = req.body || {};
  if (!name || !birthdate || !category || !dinner || !message) {
    return res.status(400).json({ error: '필수 항목을 모두 입력해 주세요.' });
  }
  try {
    const database = getDb();
    const stmt = database.prepare(`
      INSERT INTO registrations (name, birthdate, category, dinner, message)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(
      String(name).trim(),
      String(birthdate).trim(),
      String(category).trim(),
      String(dinner).trim(),
      String(message).trim()
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '저장 중 오류가 발생했습니다.' });
  }
});

app.get('/api/registrations', function (req, res) {
  try {
    const database = getDb();
    const rows = database.prepare(
      'SELECT id, name, birthdate, category, dinner, message, created_at FROM registrations ORDER BY id DESC'
    ).all();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '조회 중 오류가 발생했습니다.' });
  }
});

if (require.main === module) {
  initDb();
  app.listen(PORT, function () {
    console.log('불로런 서버: http://localhost:' + PORT);
  });
}

module.exports = { app, getDb, initDb };
