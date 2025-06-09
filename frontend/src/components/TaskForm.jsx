import React, { useState, useEffect } from 'react'
import useApiService from '../services/apiService';
import { toLocalMidnight } from '../utils/dateHelpers';


const TaskForm = ({ task=null, parentId=null, onSuccess, onCancel }) => {
    const apiService = useApiService();
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        completed: false
    });
    const [originalData, setOriginalData] = useState({});
    
    useEffect(() => {
        if (task) {
            // Format date for input field
            const formattedTask = {...task};
            if (task.due_date) {
                const dueDate = new Date(task.due_date);
                formattedTask.due_date = dueDate.toISOString().split('T')[0];
            }

            setOriginalData(formattedTask);
            setFormData(formattedTask);
        }
    }, [task]);

    useEffect(() => {
        if (parentId) { // for creating a new sub-task
            setFormData({...formData, parent_task: parentId});
        }
    }, [parentId])

    useEffect(() => {
        console.log('Original data updated:', originalData);
    }, [originalData]);
    useEffect(() => {
        console.log('Form data updated:', formData);
    }, [formData]);


    const filterChanges = (isNew=false) => {
        // reduce formData to only include modified fields
        let formChanges = {};

        // New task: Format date fields
        if (isNew) {
            for (const key in formData) {
                if (key.includes('date') && formData[key]) {
                    formChanges[key] = toLocalMidnight(formData[key]);
                    console.log(`Formatting date field (${key}) for submission:\n${formData[key]}\t--->\t${formChanges[key]}`)
                } else {
                    formChanges[key] = formData[key];
                }
            }
        }

        // Update task: Compare each field with the original data
        else {
            for (const key in formData) {
                console.log(`Checking field: ${key}...\n
                    formData: ${formData[key]}
                    originalData: ${originalData.hasOwnProperty(key) ? originalData?.[key] : 'NONE'}`)
                if (formData[key] !== originalData?.[key]) {
                    console.log('Field changes detected.');

                    // Format date fields
                    if (key.includes('date') && formData[key]) {
                        formChanges[key] = toLocalMidnight(formData[key]);
                        console.log(`Formatting date field (${key}) for submission:\n${formData[key]}\t--->\t${formChanges[key]}`)
                    } else {
                        formChanges[key] = formData[key];
                    }
                }
            }
        }
        console.log('Form Changes:', formChanges)
        return formChanges;
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let originalEmpty = (
            !task || // originalData is an empty object
            originalData?.[name] === null || // field is null in originalData
            originalData?.[name] === '' // field is empty string in originalData
        );

        // debugging logs
        // console.log(`empty? ${originalEmpty}`)
        // if (task) {console.log(`value in original data? ${originalData?.[name]}`);}
        // console.log(`editing...\nname: ${name}, value: ${value}
        //     type: ${type}, checked: ${checked}`);
        // -----------------------------------------------------------------------------
        
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
        }
        else if (value === '' && originalEmpty) { // empty field same as original data
                console.log('empty field same as original data')
                const { [name]: _, ...newFormData} = formData;
                setFormData(newFormData);
            }
        else if (type === 'date' && value === '') { // change empty date value to null
            console.log('change empty date value to null')
            setFormData(prev => ({
                ...prev,
                [name]: null
            }));
        }    
        else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            let response;
            // console.log('Sending data to API:', formData)
            
            if (task) { // Update existing task
                let formChanges = filterChanges(); // For updates, only include changed fields
                console.log('Sending data to API:', formChanges);

                response = await apiService.tasks.update(task.id, formChanges);
            } else { // Create new task
                let formChanges = filterChanges(true); // 
                console.log('Sending data to API:', formChanges);

                // console.log('Sending data to API:', formData);
                response = await apiService.tasks.create(formChanges);
            }
            console.log('Response from API:', response)

            if (onSuccess) onSuccess(response.data.data);
            setFormData({
                completed: false
            });
            setOriginalData({});

        } catch (err) {
            console.error('Error updating/creating task:', err);
            console.log('Error response:', err.response?.data)
            setError(err.response?.data?.message || 'An error occurred');
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
                    value={formData.title || ''}
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

            <div className='form-actions'>
                <button type='submit'>{task ? 'Update' : 'Create'}</button>
                {onCancel && <button type='button' onClick={onCancel}>Cancel</button>}
            </div>
        </form>
    </div>
  )
}

export default TaskForm