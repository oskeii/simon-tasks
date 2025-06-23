import React, { useEffect, useRef, useState } from 'react'
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import { useTaskManager } from '../hooks/useTaskManager';

const TaskList = () => {
  const [toggleCompleteList, setToggleCompleteList] = useState(false);
  const targetRef = useRef(null);
  const {
    // State
    tasks, data,
    loading, error, showForm, editingTask,

    // API Actions
    getTasks,
    deleteTask,
    toggleTaskCompletion,
    handleFormSuccess, // task creation and updates

    // UI Actions
    editTask,
    cancelForm,
    showNewTaskForm
  } = useTaskManager();
  

  const scrollToTarget = () => {
    if (targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  useEffect(() => {
    getTasks();
  }, []);

  if (loading) {
    return <div>Loading tasks...</div>;
  }


  return (
    <div className='task-list-container'>
      <h2>My Tasks</h2>
      <hr/>
      {error && <p className='error'>{error}</p>}

      <button onClick={showNewTaskForm}>Add New Task</button>

      {showForm && (
        <div ref={targetRef}>
          <TaskForm
            task={tasks[editingTask]}
            onSuccess={handleFormSuccess}
            onCancel={cancelForm}
          />
        </div>
      )}

      <div className='task-list'> 
        {data.total_count === 0 ? (
          <p>No tasks yet. Create one to get started!</p>
        ): (
          <>
          <div className='incomplete-list'>
            <h3>Incomplete Tasks ({data.incomplete_count})</h3>
            <ul>
              {data.incomplete_tasks.map((tId) => {
                const task = tasks[tId];
                if (!task) return null;

                return (
                  <li key={tId}>
                    <TaskItem 
                      task={task}
                      subtasks={task.sub_tasks ? task.sub_tasks.map(id => tasks[id]) : []}
                      onEdit={editTask}
                      onDelete={deleteTask}
                      onToggle={toggleTaskCompletion}
                    />
                  </li>
                )
              })}
            </ul>
          </div>

          <hr/>
          <div className='completed-list'>
            <h3>Complete Tasks ({data.complete_count})</h3>
            <button onClick={() => setToggleCompleteList(!toggleCompleteList)}>
              {toggleCompleteList ? '▼ Hide' : '▶ Show'}
            </button>
            {toggleCompleteList && (
              <ul>
                {data.complete_tasks.map((tId) => {
                  const task = tasks[tId];
                  if (!task) return null;

                  return (
                    <li key={tId} className='completed'>
                      <TaskItem 
                        task={task}
                        subtasks={task.sub_tasks ? task.sub_tasks.map(id => tasks[id]) : []}
                        onEdit={editTask}
                        onDelete={deleteTask}
                        onToggle={toggleTaskCompletion}
                      />
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          </>
        )}
      </div>
    </div>
  );
};

export default TaskList;