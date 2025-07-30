// server.js
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser')

const app = express();
const db = require('./config/db');

const cors = require('cors'); // Import the cors package

const PORT = 3000;
const Todo = require('./models/Todo');
const User = require('./models/User');

app.use(cors());
app.use(express.json());

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
  const todos = await Todo.findAll({ where: { owner: req.user.id } });
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

const patchTodo = async (req, res) => {
  const { id } = req.params;
  const body = req.body

  try {
      const todo = await Todo.findOne({ where: { id, owner: req.user.id } })

      if(todo == null) {
        return res.status(404).json({ error: 'Todo not found' });
      }
      
      const updatedTodo = {
        ...todo.toJSON(),
        ...body,
      }

      await todo.update(updatedTodo);

      res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({error: 'Failed to mark todo as complete!'});
  }
}

const authMiddleware = async (req, res, next) => {
  const userId = req.headers['current-user']

  if(userId == null) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }else{
    const user = await User.findOne({ where: { id: userId } });

    if (user == null) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.user = user;
  }

  next();
}

router.post('/register', register);
router.post('/login', login);

router.get('/todos', [authMiddleware], getTodos);
router.post('/todos', [authMiddleware], createTodo);
router.patch('/todos/:id', [authMiddleware], patchTodo);

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
