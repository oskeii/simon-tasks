import React from 'react'

const TaskItem = ({task}) => {
  return (
    <div>
        <h2>{task.title}</h2>
    </div>
  )
}

export default TaskItem