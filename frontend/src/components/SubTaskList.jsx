import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TaskForm from './TaskForm';
import useApiService from '../services/apiService';
import TaskItem from './TaskItem';

const SubTaskList = ({
    parentTask = { id: null, hasSubtasks: false },
    onUpdate,
}) => {
    const apiService = useApiService();
    const [subtasks, setSubtasks] = useState({});
    const [sortIds, setSortIds] = useState([]);
    const [loading, setLoading] = useState(parentTask.hasSubtasks);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const fetchSubtasks = async () => {
        try {
            setLoading(true);
            const response = (await apiService.tasks.subtasks(parentTask.id))
                .data.data;
            setSortIds(response.task_ids);
            setSubtasks(response.tasks);
            setError('');
        } catch (err) {
            console.error('Error fetching subtasks:', err);
            setError('Failed to load subtasks. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const editSubtask = (taskId) => {
        setEditingTask(taskId);
        setShowForm(true);
    };

    const cancelForm = () => {
        setEditingTask(null);
        setShowForm(false);
    };

    const deleteSubtask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await apiService.tasks.delete(taskId);
                let newTasks = { ...subtasks };
                delete subtasks[taskId];
                setSubtasks(newTasks);
                setSortIds(sortIds.filter((id) => id !== taskId));

                if (onUpdate) onUpdate();
            } catch (err) {
                console.error('Error deleting task', err);
                setError('Failed to delete task. Please try again.');
            }
        }
    };

    const toggleTaskCompletion = async (taskId) => {
        try {
            const response = await apiService.tasks.update(taskId, {
                completed: !subtasks[taskId].completed,
            });
            console.log('Response from API:', response);

            setSubtasks({ ...subtasks, [taskId]: response.data.data });
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Error updating task', err);
            setError(
                'Failed to update task completion status. Please try again.'
            );
        }
    };

    const handleFormSuccess = (task) => {
        // Recieving response data from TaskForm component, render updated list
        setSubtasks({ ...subtasks, [task.id]: task });
        !editingTask && setSortIds([...sortIds, task.id]);

        cancelForm();
        if (onUpdate) onUpdate();
    };

    useEffect(() => {
        if (parentTask.id && parentTask.hasSubtasks) fetchSubtasks();
    }, [parentTask]);

    if (!parentTask.id) return null;

    if (loading) {
        return <div className="subtask-list loading">Loading subtasks...</div>;
    }

    return (
        <div className="task-list">
            <div className="subtask-header">
                <h2>Sub-tasks ({sortIds.length})</h2>
            </div>

            {error && <p className="error">{error}</p>}

            <button onClick={() => setShowForm(true)}>Add a sub-task</button>

            {showForm && (
                <TaskForm
                    task={subtasks[editingTask]}
                    parentId={editingTask ? null : parentTask.id}
                    onSuccess={handleFormSuccess}
                    onCancel={cancelForm}
                />
            )}

            {sortIds.length === 0 ? (
                <p className="no-subtasks">No subtasks yet</p>
            ) : (
                <div>
                    <hr />
                    <ul>
                        {sortIds.map((tId) => {
                            const task = subtasks[tId];
                            if (!task) return null;

                            return (
                                <li
                                    key={tId}
                                    className={
                                        task.completed ? 'completed' : ''
                                    }
                                >
                                    <div className="subtask-item">
                                        <TaskItem
                                            task={task}
                                            onEdit={editSubtask}
                                            onDelete={deleteSubtask}
                                            onToggle={toggleTaskCompletion}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SubTaskList;
