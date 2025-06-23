import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TaskForm from '../components/TaskForm'
import SubTaskList from '../components/SubTaskList'
import useApiService from '../services/apiService'

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const apiService = useApiService();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await apiService.tasks.getById(taskId);
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
    if (window.confirm('Are you sure you want to delete this task?')) {
      let delete_subtasks = task.has_subtasks && window.confirm('Delete SUBTASKS too?');

      try {
        await apiService.tasks.delete(taskId, { keep_subtasks: !delete_subtasks });
        navigate('/tasks', { replace: true });
      } catch (err) {
        console.error('Error deleting task', err);
        setError('Failed to delete task. Please try again.')
      }
    }
  };

  const toggleTaskCompletion = async () => {
    try {
      const response = await apiService.tasks.update(taskId, {
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
    if (taskId) fetchTask();
  }, [taskId]);


  if (loading) {
    return (<div className='loading'>Loading task details...</div>);
  }

  if (!task) {
    error
      ? (
        <div className='error'>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/tasks')}>Return to Task List</button>
        </div>
      )
      : (<div>Task not found</div>);
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

      {!task.parent_task && (
        <div className='subtasks-section'>
          <SubTaskList parentTask={ {id: task.id, hasSubtasks: task.has_subtasks} } />
        </div>
      )}
    </div>
  );
};

export default TaskDetail