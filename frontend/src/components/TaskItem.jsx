import React, {useState, useEffect} from 'react'

const TaskItem = ({item}) => {
  console.log(item)
  const [task, setTask] = useState(item)

  useEffect(() => {

  }, [task.id])


  let PrintAttribute = (attribute) => {
    if (!attribute == null) {
      return <>{attribute}</>
    }
    return "isNull"
  }
  

  return (
    <div>
        <form>
          <input type='checkbox'/>
          <h3>{task.title}</h3>
          <p><PrintAttribute attribute={task.due_date}/></p>
          <small>{task.description}</small>
        </form>
        
    </div>
  )
}

export default TaskItem