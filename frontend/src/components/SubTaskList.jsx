import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import TaskForm from './TaskForm'

const SubTaskList = ({ parentTask, onUpdate }) => {
  const axiosPrivate = useAxiosPrivate();
  const [subTasks, setSubTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchSubTasks = async () => {
    try {
        setLoading(true);
        const response = await axiosPrivate.get(`/tasks/${parentTask.id}/subtasks/`);
        setSubTasks(response.data.data);
        setError('');
    } catch (err) {
        console.error('Error fetching subtasks:', err);
        setError('Failed to load subtasks. Please try again.')
    } finally {
        setLoading(false);
    }
  };

  const editSubTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const cancelForm = () => {
    setEditingTask(null);
    setShowForm(false);
  };

  const deleteSubTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axiosPrivate.delete(`/tasks/${taskId}/`);
        setSubTasks(subTasks.filter(t => t.id !== taskId));

        if (onUpdate) onUpdate();
      } catch (err) {
        console.error('Error deleting task', err);
        setError('Failed to delete task. Please try again.')
      }
    }
  };

  const toggleTaskCompletion = async (task) => {
    try {
        const response = await axiosPrivate.patch(`/tasks/${task.id}/`, {
            completed: !task.completed
        });
        console.log('Response from API:', response)

        setSubTasks(subTasks.map(t => t.id === task.id ? response.data.data : t));
        if (onUpdate) onUpdate();  
    } catch (err) {
        console.error('Error updating task', err);
        setError('Failed to update task completion status. Please try again.');
    }
  };

  const handleFormSuccess = (task) => { // Recieving response data from TaskForm component, render updated list
    if (editingTask) {
        setSubTasks(subTasks.map(t => t.id === task.id ? task : t));
        setEditingTask(null);
    } else {
        setSubTasks([...subTasks, task]);
    }
    setShowForm(false);
    if (onUpdate) onUpdate();
  }


  useEffect(() => {
    if (parentTask?.id) { fetchSubTasks(); }
  }, [parentTask])

  if (!parentTask) return null;

  if (loading) {
    return (<div className='subtask-list loading'>Loading subtasks...</div>)
  }


  return (
    <div className='task-list'>
        <div className='subtask-header'>
          <h2>Sub-tasks</h2>
        </div>

        {error && (<p className='error'>{error}</p>)}

        <button onClick={() => setShowForm(true)}>Add a sub-task</button>

        {showForm && (
            <TaskForm
            task={editingTask}
            parentId={editingTask ? null : parentTask.id }
            onSuccess={handleFormSuccess}
            onCancel={cancelForm}
            />
        )}

        {subTasks.length === 0 ? (
            <p className='no-subtasks'>No subtasks yet</p>
        ) : (
            <ul>
                {subTasks.map((task) => (
                    <li key={task.id} className={task.completed ? 'completed' : ''}>
                        <div className='subtask-item'>
                            <input 
                                type='checkbox'
                                checked={task.completed || false}
                                onChange={() => toggleTaskCompletion(task)}
                            />

                            <Link to={`/tasks/${task.id}`} className='task-title'>
                                <span>{task.title}</span>
                            </Link>
                            {task.due_date && (
                                <p className='task-due-date'>
                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                </p>
                            )}
                        </div>

                        <div className='task-actions'>
                            <button onClick={() => editSubTask(task)}>Edit</button>
                            <button onClick={() => deleteSubTask(task.id)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        )}

        
    </div>
  )
}

export default SubTaskList