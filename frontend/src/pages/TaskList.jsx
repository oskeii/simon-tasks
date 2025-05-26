import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import TaskForm from '../components/TaskForm';

const TaskList = () => {
  const axiosPrivate = useAxiosPrivate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Fetch tasks
  const getTasks = async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get('/tasks/');
      setTasks(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.')
    } finally {
      setLoading(false);
    }
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axiosPrivate.delete(`/tasks/${taskId}/`);
        setTasks(tasks.filter(t => t.id !== taskId));
      } catch (err) {
        console.error('Error deleting task', err);
        setError('Failed to delete task. Please try again.')
      }
    }
  };

  // Toggle task completion status
  const toggleTaskCompletion = async (task) => {
    try {
      const response = await axiosPrivate.patch(`/tasks/${task.id}/`, {
        completed: !task.completed
      });
      console.log('Response from API:', response)

      setTasks(tasks.map(t => t.id === task.id ? response.data.data : t));
    } catch (err) {
      console.error('Error updating task', err);
      console.log('Error response:', err.response?.data)

      setError('Failed to update task completion status. Please try again.');
    }
  };

  // Handle form submission success (rendering updates)
  const handleFormSuccess = (task) => {
    if (editingTask) { // Update task in list
      setTasks(tasks.map(t => t.id === task.id ? task : t));    // traversing tasks and updating the matching task
      setEditingTask(null);
    } else { // Add new task to list
      setTasks([...tasks, task]);
    }
    setShowForm(false);
  };

  // Edit task
  const editTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // Cancel form
  const cancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };


  useEffect(() => {
    getTasks();
  }, []);

  if (loading) {
    return <div>Loading tasks...</div>;
  }


  return (
    <div className='task-list-container'>
      <h2>My Tasks</h2>
      <hr/>
      {error && <p className='error'>{error}</p>}

      <button onClick={() => setShowForm(true)}>Add New Task</button>

      {showForm && (
        <TaskForm
          task={editingTask}
          onSuccess={handleFormSuccess}
          onCancel={cancelForm}
        />
      )}

      <div className='task-list'> 
        {tasks.length === 0 ? (
          <p>No tasks yet. Create one to get started!</p>
        ): (
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className={task.completed ? 'completed' : ''}>
                <div className='task-header'>
                  <input 
                    type='checkbox'
                    checked={task.completed || false}
                    onChange={() => toggleTaskCompletion(task)}
                  />

                  <Link to={`/tasks/${task.id}`} className='task-title'>
                    <h3>{task.title}</h3>
                  </Link>
                </div>

                {task.description && <p className='task-description'>{task.description}</p>}

                {task.due_date && (
                  <p className='task-due-date'>
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </p>
                )}

                <div className='task-actions'>
                  <button onClick={() => editTask(task)}>Edit</button>
                  <button onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TaskList;