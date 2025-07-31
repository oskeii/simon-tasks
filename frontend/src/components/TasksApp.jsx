import { Outlet } from 'react-router-dom';
import { TasksProvider } from '../context/TasksContext';
import { OrganizersProvider } from '../context/OrganizersContext';

const TasksApp = () => {
    return (
        <OrganizersProvider>
            <TasksProvider>
                <Outlet />
            </TasksProvider>
        </OrganizersProvider>
    );
};

export default TasksApp;
