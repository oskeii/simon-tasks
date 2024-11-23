import React from 'react'

const TaskDetail = ({item}) => {
const [task, setTask] = useState(item)
  return (
    <div>
        <h3> {}
            <input type='checkbox'></input>
        </h3>
    </div>
  )
}

export default TaskDetail