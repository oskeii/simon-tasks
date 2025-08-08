import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTasksManager } from '../context/TasksContext';
import { formatDuration } from '../utils/dateHelpers';
import { Pencil, X, ListPlus, ChevronDown, ChevronRight } from 'lucide-react';

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

    const hasSubtasks = task.has_subtasks && subtasks;

    return (
        <div className={`flex flex-col p-2 ${task.completed ? 'bg-gray-100 border-gray-300' : 'border-gray-200'} text-gray-700 rounded-2xl border-1 hover:shadow-md transition-all duration-300`}>
        {/* Task Header */}
            <div className='flex justify-between'>
                <div className="mb-2 flex items-center">
                    <input className='mr-2 h-5 w-5'
                        type="checkbox"
                        checked={task.completed || false}
                        onChange={() =>
                            onToggle
                            ? onToggle(task.id)
                            : toggleTaskCompletion(task.id)
                        }
                        />

                    <Link
                        className="text-gray-900 hover:text-gray-600 transition-color duration-200"
                        to={`/tasks/${task.id}`}
                        >
                        <h3 className={`${task.completed && 'line-through'}`}>{task.title}</h3>
                    </Link>
                </div>

            {/* Task Actions */}
                <div className="flex font-light">
                    <button className='btn p-0 text-gray-500 bg-transparent hover:bg-gray-200 hover:text-gray-900 ring-0'
                        title='Edit task'
                        onClick={() =>
                            onEdit ? onEdit(task.id) : editTask(task.id)
                        }
                    >
                        <Pencil className='inline mx-1 '/>
                    </button>
                    <button className='btn p-0 text-gray-500 bg-transparent hover:bg-red-200 hover:text-red-950 ring-0'
                        title='Delete task'
                        onClick={() =>
                            onDelete ? onDelete(task.id) : deleteTask(task.id)
                        }
                    >
                        <X className='inline mx-1 '/>
                    </button>
                </div>
            </div>

        {/* Task Details */}
            <div className='flex flex-col'>
                {task.description && (
                    <p className="text-gray-700/80">{task.description}</p>
                )}

                <div className='flex items-center justify-between pr-4'>

                    <div className='flex flex-col'>
                        {task.category_name && !task.parent_task && (
                            <p className="italic font-semibold underline underline-offset-2">
                                {task.category_name}
                            </p>
                        )}

                        {task.tag_names && (
                            <div className="flex overflow-x-auto">
                                {task.tags.map((tagId) => {
                                    let i = task.tags.indexOf(tagId);
                                    return <p key={tagId} className='rounded-full border border-sky-100 bg-sky-50 text-sky-950 px-2 py-0.5 m-0.5'>
                                        #{task.tag_names[i]}
                                    </p>;
                                })}
                            </div>
                        )}
                    </div>

                    <div className='flex flex-col items-center gap-1'>
                        {task.due_date && (
                            <p className="px-2 font-medium bg-indigo-50 rounded-full hover:bg-indigo-100">
                                Due: {new Date(task.due_date).toLocaleDateString()}
                            </p>
                        )}
                        
                        {task.estimated_time && (
                            <p className="task-duration">
                                Estimated: {formatDuration(task.estimated_time)}
                            </p>
                        )}
                    </div>
                </div>

            </div>
        <hr className='mt-2 opacity-15' />
        {/* SUBTASKS SECTION */}
            <div className="subtasks-container">
                <div className="flex flex-row-reverse justify-between">
                    {!task.parent_task && (
                        <button className='btn p-0 bg-transparent ring-0 text-gray-600 hover:bg-gray-200 hover:text-gray-900 hover:scale-105'
                        title='Create subtask'
                        onClick={() => showNewTaskForm(task.id)}>
                            <ListPlus size={30} />
                        </button>
                    )}

                    <button className={`btn group p-0 pr-1.5 bg-transparent ring-0 text-gray-600 hover:bg-gray-200 hover:text-gray-900 ${showSubtasks && 'text-gray-900'} rounded-full`}
                    onClick={toggleSubtasks}>
                        {showSubtasks 
                        ? <ChevronDown className='inline mr-1 group-hover:scale-90 group-hover:translate-y-1 transition-all duration-300'/>
                        : <ChevronRight className='inline mr-1 group-hover:scale-110 group-hover:translate-x-1 transition-all duration-300'/>} 
                        <strong>{task.sub_tasks.length}</strong> subtasks
                    </button>
                </div>

                {showSubtasks && hasSubtasks && (
                    <div className="border-l border-gray-600/50 ml-4 mr-10 pl-2">
                        <ul>
                            {subtasks.map((subtask) => (
                                <li
                                    key={subtask.id}
                                    className={`${subtask.completed && 'line-through text-gray-400'} mt-1 pl-1 hover:bg-blue-50 border border-gray-200`}
                                >
                                    {/* Header */}
                                    <div className="flex justify-between">
                                        <div className='flex items-center'>
                                            <input className='mr-2 h-4 w-4'
                                                type="checkbox"
                                                checked={subtask.completed || false}
                                                onChange={() =>
                                                    onToggle
                                                    ? onToggle(subtask.id)
                                                    : toggleTaskCompletion(
                                                        subtask.id
                                                    )
                                                }
                                                />

                                            <Link
                                                to={`/tasks/${subtask.id}`}
                                                className="task-title"
                                                >
                                                <h4 className='text-lg'>{subtask.title}</h4>
                                            </Link>
                                        </div>

                                    {subtask.due_date && (
                                            <p className="m-1 px-1 bg-blue-50 rounded-full hover:bg-blue-100">
                                                Due:{' '}
                                                <span className='font-medium '>
                                                    {new Date(
                                                    subtask.due_date
                                                    ).toLocaleDateString()}
                                                </span>
                                            </p>
                                        )}
                                        <div className="flex font-light justify-between">
                                            <button className='btn p-0 text-gray-500 bg-transparent hover:bg-gray-200 hover:text-gray-900 ring-0'
                                                title='Edit subtask'
                                                onClick={() =>
                                                    onEdit
                                                        ? onEdit(subtask.id)
                                                        : editTask(subtask.id)
                                                }
                                            >
                                                <Pencil size={20} />
                                            </button>
                                            <button className='btn p-0 text-gray-500 bg-transparent hover:bg-red-200 hover:text-red-950 ring-0'
                                                title='Delete subtask'
                                                onClick={() =>
                                                    onDelete
                                                        ? onDelete(subtask.id)
                                                        : deleteTask(subtask.id)
                                                }
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className='flex items-center justify-between'>
                                        {subtask.description && (
                                            <p className="task-description">
                                                {subtask.description}
                                            </p>
                                        )}

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
