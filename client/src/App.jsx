import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Load tasks on first render
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to load tasks', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }
    setError('');

    try {
      if (editingId) {
        // Update existing task
        const res = await axios.put(`${API_URL}/${editingId}`, {
          title, description, status
        });
        setTasks(tasks.map(t => t.id === editingId ? res.data : t));
        setEditingId(null);
      } else {
        // Create new task
        const res = await axios.post(API_URL, { title, description, status });
        setTasks([...tasks, res.data]);
      }
      setTitle('');
      setDescription('');
      setStatus('To Do');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setStatus('To Do');
    setError('');
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const res = await axios.put(`${API_URL}/${task.id}`, {
        ...task,
        status: newStatus
      });
      setTasks(tasks.map(t => t.id === task.id ? res.data : t));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div className="container">
      <h1>Mini Task Tracker</h1>

      <form onSubmit={handleSubmit} className="task-form">
        <h3>{editingId ? 'Edit Task' : 'New Task'}</h3>
        {error && <p className="error">{error}</p>}

        <input
          type="text"
          placeholder="Task title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>

        <div className="form-buttons">
          <button type="submit">{editingId ? 'Update Task' : 'Add Task'}</button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit}>Cancel</button>
          )}
        </div>
      </form>

      <h2>Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks yet. Add one above.</p>
      ) : (
        <div className="task-list">
          {tasks.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <h3>{task.title}</h3>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task, e.target.value)}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
              <p>{task.description}</p>
              <div className="task-actions">
                <button onClick={() => handleEdit(task)}>Edit</button>
                <button onClick={() => handleDelete(task.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;