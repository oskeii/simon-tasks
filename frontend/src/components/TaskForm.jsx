import React, { useState, useEffect, useRef, memo } from 'react';
import useApiService from '../services/apiService';
import { toLocalMidnight } from '../utils/dateHelpers';
import { useOrganizers } from '../context/OrganizersContext';
import { useTasksManager } from '../context/TasksContext';
import TagSelector from './TagSelector';
import CategorySelector from './CategorySelector';
import { X } from 'lucide-react';

const TaskForm = ({
    task = null,
    parentId = null,
    onSuccess = null,
    onCancel = null,
}) => {
    console.log('TaskForm rendered!');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        completed: false,
        tags: [],
    });
    const [originalData, setOriginalData] = useState({});

    const inputRef = useRef(null);
    const apiService = useApiService();
    const { handleFormSuccess, cancelForm } = useTasksManager();


    useEffect(() => {
        inputRef.current?.focus();

        if (task) {
            // Format date for input field
            const formattedTask = { ...task };
            if (task.due_date) {
                const dueDate = new Date(task.due_date);
                formattedTask.due_date = dueDate.toISOString().split('T')[0];
            }

            setOriginalData(formattedTask);
            setFormData(formattedTask);
        }
    }, [task]);

    useEffect(() => {
        if (parentId) {
            // for creating a new sub-task
            setFormData({ ...formData, parent_task: parentId });
        }
    }, [parentId]);

    useEffect(() => {
        console.log('Original data updated:', originalData);
    }, [originalData]);
    useEffect(() => {
        console.log('Form data updated:', formData);
    }, [formData]);

    const filterChanges = (isNew = false) => {
        // reduce formData to only include modified fields
        let formChanges = {};

        // New task: Format date fields
        if (isNew) {
            for (const key in formData) {
                if (key.includes('date') && formData[key]) {
                    formChanges[key] = toLocalMidnight(formData[key]);
                    console.log(
                        `Formatting date field (${key}) for submission:\n${formData[key]}\t--->\t${formChanges[key]}`
                    );
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
                    originalData: ${originalData.hasOwnProperty(key) ? originalData?.[key] : 'NONE'}`);
                if (formData[key] !== originalData?.[key]) {
                    console.log('Field changes detected.');

                    // Format date fields
                    if (key.includes('date') && formData[key]) {
                        formChanges[key] = toLocalMidnight(formData[key]);
                        console.log(
                            `Formatting date field (${key}) for submission:\n${formData[key]}\t--->\t${formChanges[key]}`
                        );
                    } else {
                        formChanges[key] = formData[key];
                    }
                }
            }
        }
        console.log('Form Changes:', formChanges);
        return formChanges;
    };

    const handleTagsChange = (selectedTagIds) => {
        console.log('Tag Selected, updating form data');
        setFormData({ ...formData, tags: [...selectedTagIds] });
    };

    const handleCategorySelect = (categoryId) => {
        console.log('Category Selected, updating form data');
        setFormData({ ...formData, category: categoryId });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let originalEmpty =
            !task || // originalData is an empty object
            originalData?.[name] === null || // field is null in originalData
            originalData?.[name] === ''; // field is empty string in originalData

        // debugging logs
        // console.log(`empty? ${originalEmpty}`)
        // if (task) {console.log(`value in original data? ${originalData?.[name]}`);}
        // console.log(`editing...\nname: ${name}, value: ${value}
        //     type: ${type}, checked: ${checked}`);
        // -----------------------------------------------------------------------------

        if (type === 'checkbox') {
            setFormData((prev) => ({
                ...prev,
                [name]: checked,
            }));
        } else if (value === '' && originalEmpty) {
            // empty field same as original data
            console.log('empty field same as original data');
            const { [name]: _, ...newFormData } = formData;
            setFormData(newFormData);
        } else if (type === 'date' && value === '') {
            // change empty date value to null
            console.log('change empty date value to null');
            setFormData((prev) => ({
                ...prev,
                [name]: null,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            let response;
            // console.log('Sending data to API:', formData)

            if (task) {
                // UPDATE existing task
                let formChanges = filterChanges(); // For updates, only include changed fields
                console.log('Sending data to API:', formChanges);

                response = await apiService.tasks.update(task.id, formChanges);
            } else {
                // CREATE new task
                let formChanges = filterChanges(true); //
                console.log('Sending data to API:', formChanges);

                // console.log('Sending data to API:', formData);
                response = await apiService.tasks.create(formChanges);
            }
            console.log('Response from API:', response);

            onSuccess
                ? onSuccess(response.data.data)
                : handleFormSuccess(response.data.data);

            setFormData({
                completed: false,
            });
            setOriginalData({});
        } catch (err) {
            console.error('Error updating/creating task:', err);
            console.log('Error response:', err.response?.data);
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className='flex items-center justify-between'>
                <h2 className='m-0'>
                    {task ? 'Edit Task' : 'Create New Task'}
                </h2>
                <button className='btn text-gray-400 hover:text-gray-600 bg-transparent ring-0 p-0 m-0'
                    onClick={() => (onCancel ? onCancel() : cancelForm())}
                >
                    <X size={20} />
                </button>
            </div>
            {error && <p className="error">{error}</p>}

            {/* Form */}
            <form onSubmit={handleSubmit} className='bg-amber-50 p-4 rounded-md border border-gray-300'>
                <div>
                    <label htmlFor='title' className='block text-sm text-gray-700'>Title</label>
                    <input className='w-full px-3 py-1 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
                        ref={inputRef}
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title || ''}
                        onChange={handleChange}
                        placeholder='Enter task title...'
                        required
                    />
                
                </div>

                <div>
                    <label htmlFor='description' className='block text-sm text-gray-700'>Description (optional)</label>
                        <textarea className='w-full px-3 py-1 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
                            id="description"
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            rows="3"
                            placeholder='Enter task description...'
                        />
                    
                </div>

                <div>
                    <CategorySelector
                        onSelect={handleCategorySelect}
                    />
                </div>

                <div>
                    <TagSelector onTagsChange={handleTagsChange} />
                </div>

                <div>
                    <label htmlFor='due_date' className='block text-sm text-gray-700'>Due Date</label>
                        <input className='w-full px-3 py-1 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
                            type="date"
                            id="due_date"
                            name="due_date"
                            value={formData.due_date || ''}
                            onChange={handleChange}
                        />
                </div>

                <div className='flex items-center space-x-2 my-2'>
                    <input className='h-4 w-4'
                        type="checkbox"
                        name="completed"
                        checked={formData.completed}
                        onChange={handleChange}
                    />
                    <label htmlFor='completed' className='text-gray-700 m-0'>Completed</label>       
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-2">
                    <button className='btn text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 ring-0'
                        type="button"
                        onClick={() => (onCancel ? onCancel() : cancelForm())}
                    >
                        Cancel
                    </button>
                    <button className='btn text-sm font-medium ring-0 '
                        type="submit"
                    >
                        {task ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default memo(TaskForm);
