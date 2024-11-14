import React, { useEffect, useState } from 'react'
import api from '../axios'

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('tasks/');
        setTasks(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks', err);
        setLoading(false);
      }
    };
    fetchTasks();
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

        <div className='task-list'>
          <h3>My tasks:</h3>
          <ul>
            {Array.isArray(tasks) && tasks.map((task) => (
              <li key={task.id}>{task.title}</li>
            ))}
          </ul>
        </div>

    </div>
  );
};

export default TaskList;