import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTasksManager } from '../context/TasksContext';

const TaskItem = ({
    task,
    subtasks = [],
    onEdit = null,
    onDelete = null,
    onToggle = null,
}) => {
    const { editTask, deleteTask, toggleTaskCompletion, showNewTaskForm } =
        useTasksManager();
    const [showSubtasks, setShowSubtasks] = useState(false);

    const toggleSubtasks = () => {
        setShowSubtasks(!showSubtasks);
    };

    return (
        <div>
            <div className="task-header">
                <input
                    type="checkbox"
                    checked={task.completed || false}
                    onChange={() =>
                        onToggle
                            ? onToggle(task.id)
                            : toggleTaskCompletion(task.id)
                    }
                />

                <Link
                    to={`/tasks/${task.id}`}
                    className="task-title"
                >
                    <h3>{task.title}</h3>
                </Link>
            </div>

            {task.description && (
                <p className="task-description">{task.description}</p>
            )}
            {task.estimated_time && (
                <p className="task-duration">
                    Estimated Duration: {task.estimated_time}
                </p>
            )}

            {task.due_date && (
                <p className="task-due-date">
                    Due: {new Date(task.due_date).toLocaleDateString()}
                </p>
            )}

            {task.category_name && !task.parent_task && (
                <p className="task-category">
                    <strong>{task.category_name}</strong>
                </p>
            )}
            {task.tag_names && (
                <div className="task-tags">
                    {task.tags.map((tagId) => {
                        let i = task.tags.indexOf(tagId);

                        return <p key={tagId}>#{task.tag_names[i]}</p>;
                    })}
                </div>
            )}

            <div className="task-actions">
                <button
                    onClick={() =>
                        onEdit ? onEdit(task.id) : editTask(task.id)
                    }
                >
                    Edit
                </button>
                <button
                    onClick={() =>
                        onDelete ? onDelete(task.id) : deleteTask(task.id)
                    }
                >
                    Delete
                </button>
            </div>

            {/* SUBTASKS SECTION */}
            <div className="subtasks-container">
                <div className="subtasks-header">
                    {!task.parent_task && (
                        <button onClick={() => showNewTaskForm(task.id)}>
                            + New Subtask
                        </button>
                    )}

                    {task.has_subtasks && subtasks && (
                        <button onClick={toggleSubtasks}>
                            {showSubtasks ? '▼ Hide' : '▶ Show'} Subtasks
                        </button>
                    )}
                </div>

                {showSubtasks && task.has_subtasks && subtasks && (
                    <div className="subtasks-list">
                        <ul>
                            {subtasks.map((subtask) => (
                                <li
                                    key={subtask.id}
                                    className={
                                        subtask.completed ? 'completed' : ''
                                    }
                                >
                                    <div className="task-header">
                                        <input
                                            type="checkbox"
                                            checked={subtask.completed || false}
                                            onChange={() =>
                                                onToggle
                                                    ? onToggle(subtask.id)
                                                    : toggleTaskCompletion(
                                                          subtask.id
                                                      )
                                            } //
                                        />

                                        <Link
                                            to={`/tasks/${subtask.id}`}
                                            className="task-title"
                                        >
                                            <h3>{subtask.title}</h3>
                                        </Link>
                                    </div>

                                    {subtask.description && (
                                        <p className="task-description">
                                            {subtask.description}
                                        </p>
                                    )}

                                    {subtask.due_date && (
                                        <p className="task-due-date">
                                            Due:{' '}
                                            {new Date(
                                                subtask.due_date
                                            ).toLocaleDateString()}
                                        </p>
                                    )}

                                    <div className="task-actions">
                                        <button
                                            onClick={() =>
                                                onEdit
                                                    ? onEdit(subtask.id)
                                                    : editTask(subtask.id)
                                            }
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                onDelete
                                                    ? onDelete(subtask.id)
                                                    : deleteTask(subtask.id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskItem;
