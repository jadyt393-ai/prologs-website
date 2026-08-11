const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET =
  process.env.JWT_SECRET || 'change-this-secret-in-render';

const dataDir = path.join(__dirname, 'data');
const db = new Database(path.join(dataDir, 'prologs.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    category TEXT NOT NULL,
    option TEXT NOT NULL,
    country TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Prologs backend is running',
  });
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    const existing = db
      .prepare('SELECT id FROM users WHERE username = ?')
      .get(username);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = db
      .prepare(
        'INSERT INTO users (username, password) VALUES (?, ?)'
      )
      .run(username, hashedPassword);

    const token = jwt.sign(
      {
        id: result.lastInsertRowid,
        username,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: result.lastInsertRowid,
        username,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Unable to create account.',
    });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    const user = db
      .prepare(
        'SELECT id, username, password FROM users WHERE username = ?'
      )
      .get(username);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Unable to login.',
    });
  }
});

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  const token = header.substring(7);

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
}

app.get('/api/me', authenticate, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

app.post('/api/enquiries', (req, res) => {
  try {
    const {
      username = null,
      category,
      option,
      country = null,
    } = req.body;

    if (!category || !option) {
      return res.status(400).json({
        success: false,
        message: 'Category and option are required.',
      });
    }

    const result = db
      .prepare(
        `INSERT INTO enquiries
        (username, category, option, country)
        VALUES (?, ?, ?, ?)`
      )
      .run(username, category, option, country);

    res.status(201).json({
      success: true,
      message: 'Enquiry saved successfully.',
      enquiryId: result.lastInsertRowid,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Unable to save enquiry.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Prologs backend running on port ${PORT}`);
});
