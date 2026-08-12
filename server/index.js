const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

//  The Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for the tasks
let tasks = [];
let nextId = 1;

// GET all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// POST create a task
app.post('/tasks', (req, res) => {
  const { title, description, status } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Task title is required' });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: description || '',
    status: status || 'To Do'
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PUT update a task
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { title, description, status } = req.body;

  if (title !== undefined) {
    if (title.trim() === '') {
      return res.status(400).json({ error: 'Task title cannot be empty' });
    }
    task.title = title.trim();
  }
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;

  res.json(task);
});

// DELETE a task
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(index, 1);
  res.json({ message: 'Task deleted successfully', id });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});