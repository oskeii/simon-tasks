import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import TaskForm from '../components/TaskForm'
import SubTaskList from '../components/SubTaskList'

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await axiosPrivate.get(`/tasks/${taskId}/`);
      setTask(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching task', err);
      setError('Failed to load task details. The task may have been deleted or you may not have permission...');
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task? All subtasks will be reassigned to the parent task, if any.')) {
      try {
        await axiosPrivate.delete(`/tasks/${taskId}/`);
        navigate('/tasks', { replace: true });
      } catch (err) {
        console.error('Error deleting task', err);
        setError('Failed to delete task. Please try again.')
      }
    }
  };

  const toggleTaskCompletion = async () => {
    try {
      const response = await axiosPrivate.patch(`/tasks/${taskId}/`, {
        completed: !task.completed
      });
      console.log('Response from API:', response)
      
      setTask(response.data.data);
    } catch (err) {
      console.error('Error updating task', err);
      setError('Failed to update task completion status. Please try again.')
    }
  };

  const handleEditSuccess = (updatedTask) => {
    setTask(updatedTask);
    setEditing(false);
  }

  useEffect(() => {
    if (taskId) { fetchTask(); }
  }, [taskId]);


  if (loading) {
    return (<div className='loading'>Loading task details...</div>);
  }

  if (error && !task) {
    return (
      <div className='error'>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/tasks')}>Return to Task List</button>
      </div>
    );
  }

  if (!task) {
    return (<div>Task not found</div>);
  }
  

  return (
    <div className='task-detail'>
      <div className='task-detail-header'>
        <button onClick={() => navigate('/tasks')}> &larr; Back to Tasks</button>
      </div>

      {error && <p className='error'>{error}</p>}

      {editing ? (
        <TaskForm
          task={task}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <div className='task-info'>
          <div className='task-title-bar'>
            <input 
              type='checkbox'
              checked={task.completed || false}
              onChange={toggleTaskCompletion}
              className='task-checkbox'
            />
            <h2 className={task.completed ? 'completed' : ''}>{task.title}</h2>
          </div>

          {task.description && (
            <div className='task-description'>
              <h3>Description:</h3>
              <p>{task.description}</p>
            </div>
          )}

          <div className='task-metadata'>
            {task.due_date && (
              <p>
                <strong>Due:</strong> {new Date(task.due_date).toLocaleDateString()}
              </p>
            )}

            <p>
              <strong>Created:</strong> {new Date(task.created_at).toLocaleString()}
            </p>

            {task.completed && task.completed_at && (
              <p>
                <strong>Completed:</strong> {new Date(task.completed_at).toLocaleString()}
              </p>
            )}

            {task.parent_task && (
              <p>
                <strong>Parent task:</strong> <a href={`/tasks/${task.parent_task}`}>View parent task</a>
              </p>
            )}
          </div>

          <div className='task-actions'>
            <button onClick={() => setEditing(true)}>Edit</button>
            <button onClick={deleteTask}>Delete</button>
          </div>
        </div>
      )}

      <div className='subtasks-section'>
        <SubTaskList parentTask={task} />
      </div>
    </div>
  );
};

export default TaskDetail