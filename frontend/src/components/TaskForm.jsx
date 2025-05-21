import React, { useState, useEffect } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'


const TaskForm = ({ task=null, onSuccess, onCancel }) => {
    const axiosPrivate = useAxiosPrivate();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title:'',
        description: '',
        due_date: '',
        completed: false
    });
    
    useEffect(() => {
        if (task) {
            // Format date for input field
            const formattedTask = {...task};
            if (task.due_date) {
                const dueDate = new Date(task.due_date);
                formattedTask.due_date = dueDate.toISOString().split('T')[0];
            }
            setFormData(formattedTask);
        }
    }, [task]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            let response;
            if (task) { // Update existing task
                response = await axiosPrivate.put(`/tasks/${task.id}/`, formData);
            } else { // Create new task
                response = await axiosPrivate.post('/tasks/', formData);
            }

            if (onSuccess) onSuccess(response.data);
            setFormData({
                title:'',
                description: '',
                due_date: '',
                completed: false
            });
        } catch (err) {
            console.error('Error updating/creating task:', err);
            setError(err.response?.data?.message || 'An error occured');
        }
    };


  return (
    <div className='task-form'>
        <h3>{task ? 'Edit Task' : 'Create New Task'}</h3>
        {error && <p className='error'>{error}</p>}

        <form onSubmit={handleSubmit}>
            <div className='form-group'>
                <label htmlFor='title'>Title</label>
                <input
                    type='text'
                    id='title'
                    name='title'
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className='form-group'>
                <label htmlFor='description'>Description</label>
                <textarea
                    id='description'
                    name='description'
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows='3'
                />
            </div>

            <div className='form-group'>
                <label htmlFor='due_date'>Due Date</label>
                <input
                    type='date'
                    id='due_date'
                    name='due_date'
                    value={formData.due_date || ''}
                    onChange={handleChange}
                />
            </div>

            <div className='form-group'>
                <label>
                    <input
                        type='checkbox'
                        name='completed'
                        checked={formData.completed}
                        onChange={handleChange}
                    />
                    Completed
                </label>
            </div>

            <div className='form-group'>
                <button type='submit'>{task ? 'Update' : 'Create'}</button>
                {onCancel && <button type='button' onClick={onCancel}>Cancel</button>}
            </div>
        </form>
    </div>
  )
}

export default TaskForm