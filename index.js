// server.js
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser')

const app = express();x
const db = require('./config/db');

const cors = require('cors'); // Import the cors package

const PORT = 3000;
const Todo = require('./models/Todo');
const User = require('./models/User');

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded())
app.use(bodyParser.json())

const register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.create({ email, password });

    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getTodos = async (req, res) => {
  const todos = await Todo.findAll();
  res.json(todos);
};

const createTodo = async (req, res) => {
  const {
    title,
    category,
    description,
    createdAt,
    completedAt,
    isDone,
    isDeleted,
  } = req.body;

  const todo = await Todo.create({ 
    title,
    category,
    description,
    createdAt,
    completedAt,
    isDone,
    isDeleted,
    owner: req.user.id
  });

  res.status(201).json(todo);
};

const authMiddleware = async (req, res, next) => {
  const userId = req.headers['current-user']

  if(userId == null) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }else{
    const user = await User.findOne({ where: { id: userId } });

    req.user = user;
  }

  next();
}

router.post('/register', register);
router.post('/login', login);

router.get('/todos', [authMiddleware], getTodos);
router.post('/todos', [authMiddleware], createTodo);

app.use('/', router);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

(async () => {
  try {
    await db.sync();
    console.log('Database synced');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
  }
})();
