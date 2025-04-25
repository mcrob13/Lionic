const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Конфигурация
const USERS_FILE = path.join(__dirname, 'users.json');
const JWT_SECRET = 'your-secret-key-here';
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Улучшенные CORS настройки
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:3000', 'http://localhost:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Обработка preflight запросов
app.options('*', cors());

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use('/javascript', express.static(path.join(__dirname, 'javascript')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/img', express.static(path.join(__dirname, 'img')));

// Вспомогательные функции
function getUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, '[]');
      return [];
    }
    const data = fs.readFileSync(USERS_FILE);
    return JSON.parse(data) || [];
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
}

function saveUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

function validatePassword(password) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!PASSWORD_REGEX.test(password)) {
    return { 
      valid: false, 
      message: 'Password must contain at least one uppercase, one lowercase, one number and one special character' 
    };
  }
  return { valid: true };
}

// Middleware аутентификации
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const users = getUsers();
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });
    
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Invalid token' });
  }
}

// Роуты
app.post('/api/register', (req, res) => {
  const { name, email, password, phone } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({ success: false, message: passwordValidation.message });
  }

  const users = getUsers();
  if (users.some(user => user.email === email)) {
    return res.status(400).json({ success: false, message: 'Email already exists' });
  }

  const newUser = { 
    id: Date.now(), 
    name, 
    email, 
    password,
    phone: phone || null 
  };
  
  saveUsers([...users, newUser]);
  
  res.json({ 
    success: true, 
    user: { 
      id: newUser.id, 
      name: newUser.name, 
      email: newUser.email 
    } 
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ 
    success: true, 
    token,
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email,
      phone: user.phone 
    } 
  });
});

app.get('/api/user', authenticate, (req, res) => {
  res.json({ 
    success: true, 
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone
    }
  });
});

app.get('/api/user/:id', authenticate, (req, res) => {
  const users = getUsers();
  const user = users.find(u => u.id === parseInt(req.params.id));
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  res.json({ 
    success: true, 
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    }
  });
});

// Обработка всех остальных маршрутов
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (!fs.existsSync(USERS_FILE)) {
    saveUsers([]);
  }
});