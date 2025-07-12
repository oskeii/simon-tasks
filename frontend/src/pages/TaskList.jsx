import React, { useEffect, useState } from 'react'
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import { useTasksManager, useTasks } from '../context/TasksContext';

const TaskList = () => {
  const [toggleCompleteList, setToggleCompleteList] = useState(false);
  const state = useTasks();

  const { tasks, data } = state;
  console.log('LOCAL TASKS SET:', tasks)
  console.log('LOCAL DATA:', data)
  console.log('editing:', state.editingTask)
  console.log('linking parent:', state.linkingParent)

  const {
    getTasks,
    showNewTaskForm,
    cancelForm
  } = useTasksManager();
  
  
  useEffect(() => {
    getTasks();
    cancelForm();
  }, []);


  if (state.loading) {
    return <div>Loading tasks...</div>;
  }


  return (
    <div className='task-list-container'>
      <h2>My Tasks</h2>
      <hr/>
      {state.error && <p className='error'>{state.error}</p>}

      <button onClick={showNewTaskForm}>Add New Task</button>

      {state.showForm && (
        <div>
          <TaskForm
            task={tasks[state.editingTask]}
            parentId={state.linkingParent}
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