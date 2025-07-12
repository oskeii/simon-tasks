import { Outlet } from "react-router-dom"
import { TasksProvider } from "../context/TasksContext"

const TasksApp = () => {

    return (
        <TasksProvider>
            <Outlet />
        </TasksProvider>
    )
}

export default TasksApp;