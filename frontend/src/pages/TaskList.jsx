import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import TaskItem from '../components/TaskItem';
import { formToJSON } from 'axios';

const TaskList = () => {
  const axiosPrivate = useAxiosPrivate();

  const [tasks, setTasks] = useState([]);
  const [newTask, SetNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  
  const getTasks = async () => {
    try {
      const response = await axiosPrivate.get('/tasks/');
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tasks', err);
      setLoading(false);
    }
  };

  const createTask = async () => {
    try {
      let data = {"title": newTask}
      const response = await api.post('tasks/', data=data);

    } catch (err) {
      console.error('Error adding new task', err);
    }
  };

  useEffect(() => {


    getTasks();
  }, []);

  if (loading) {
    return <div>Loading tasks...</div>;
  }

  
  if (!Array.isArray(tasks)) {
    console.log(tasks);
    return <p>response not an array.</p>
  }


  return (
    <div>
      <input
        type='text'
        name='new-task' value={newTask} placeholder='new task'
        onChange={(e) => {SetNewTask(e.target.value)}}>
      </input>
      <button onClick={createTask}>Add</button>
      <hr/>
      <div className='task-list'>
        <h3>My tasks:</h3>
        <ul>
          {Array.isArray(tasks) && tasks.map((task) => (
            <div>
              <li key={task.id}>{task.title}</li>
              {/* <li>
                <TaskItem key={task.id} item={task}/>
              </li> */}
              
            </div>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default TaskList;