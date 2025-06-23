import React, { useState } from 'react'
import { Link } from 'react-router-dom';

const TaskItem = ({ task, subtasks=[], onEdit, onDelete, onToggle }) => {
    const [showSubtasks, setShowSubtasks] = useState(false);

    const toggleSubtasks = () => {
        setShowSubtasks(!showSubtasks);
    }

  return (
    <div>

    <div className='task-header'>
        <input 
            type='checkbox'
            checked={task.completed || false}
            onChange={() => onToggle(task.id)}
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
        <button onClick={() => onEdit(task.id)}>Edit</button>
        <button onClick={() => onDelete(task.id)}>Delete</button>
    </div>

    {/* SUBTASKS SECTION */}
    {task.has_subtasks && subtasks && (
        <div className='subtasks-container'> 
    
            <div className='subtasks-header'>
                <button onClick={toggleSubtasks}>
                    {showSubtasks ? '▼ Hide' : '▶ Show'} Subtasks
                </button>
            </div> 

            {showSubtasks && (
            <div className='subtasks-list'>
                <ul>
                    {subtasks.map((subtask) => (
                        <li key={subtask.id} className={subtask.completed ? 'completed' : ''}>

                            <div className='task-header'>
                                <input 
                                    type='checkbox'
                                    checked={subtask.completed || false}
                                    onChange={() => onToggle(subtask.id)} //
                                />
            
                                <Link to={`/tasks/${subtask.id}`} className='task-title'>
                                    <h3>{subtask.title}</h3>
                                </Link>
                            </div>
            
                            {subtask.description && <p className='task-description'>{subtask.description}</p>}
        
                            {subtask.due_date && (
                                <p className='task-due-date'>
                                    Due: {new Date(subtask.due_date).toLocaleDateString()}
                                </p>
                            )}
            
                            <div className='task-actions'>
                                <button onClick={() => onEdit(subtask.id)}>Edit</button>
                                <button onClick={() => onDelete(subtask.id)}>Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            )}
        </div>   
    )}
    </div>
  )
}

export default TaskItem