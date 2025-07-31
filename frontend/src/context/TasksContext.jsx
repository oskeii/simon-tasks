import { createContext, useContext, useReducer } from 'react';
import {
    tasksReducer,
    initialState,
    taskActions,
} from '../reducers/tasksReducer';
import useApiService from '../services/apiService';

export const TasksContext = createContext(null);
export const TasksDispatchContext = createContext(null);

export const TasksProvider = ({ children }) => {
    const [state, dispatch] = useReducer(tasksReducer, initialState);

    return (
        <TasksContext.Provider value={state}>
            <TasksDispatchContext.Provider value={dispatch}>
                {children}
            </TasksDispatchContext.Provider>
        </TasksContext.Provider>
    );
};

// read context and call dispatch functions from any nested component
export const useTasks = () => {
    return useContext(TasksContext);
};

export const useTasksDispatch = () => {
    return useContext(TasksDispatchContext);
};

// // Initial state
// const initialState = {
//   tasks: {},
//   data: {
//     total_count: 0,
//     parent_count: 0,
//     incomplete_count: 0,
//     complete_count: 0,
//     incomplete_tasks: [],
//     complete_tasks: [],
//   },
//   loading: true,
//   error: '',
//   showForm: false,
//   editingTask: null,
//   linkingParent: null,
// };

export const useTasksManager = () => {
    const state = useTasks();
    const dispatch = useTasksDispatch();
    const apiService = useApiService();

    // Fetch tasks
    const getTasks = async (params = {}) => {
        try {
            dispatch(taskActions.setLoading(true));
            const response = await apiService.tasks.getAll(params);
            dispatch(taskActions.setTasks(response.data.data));
        } catch (err) {
            console.error('Error fetching tasks:', err);
            dispatch(
                taskActions.setError('Failed to load tasks. Please try again.')
            );
        }
    };

    const getSubtasks = async (parentId) => {
        try {
            dispatch(taskActions.setLoading(true));
            const response = await apiService.tasks.subtasks(parentId);
            dispatch(taskActions.setTasks(response.data.data));
        } catch (err) {
            console.error('Error fetching tasks:', err);
            dispatch(
                taskActions.setError(
                    'Failed to load subtasks. Please try again.'
                )
            );
        }
    };

    // Delete task
    const deleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            const task = state.tasks[taskId];
            let delete_subtasks = false;

            if (task && task.has_subtasks) {
                delete_subtasks = window.confirm('Delete SUBTASKS too?');
            }
            try {
                const response_data = (
                    await apiService.tasks.delete(taskId, {
                        keep_subtasks: !delete_subtasks,
                    })
                ).data.data;
                console.log('Task deletion response data: ', response_data);
                dispatch(
                    taskActions.deleteTask(
                        taskId,
                        response_data,
                        !delete_subtasks
                    )
                );
            } catch (err) {
                console.error('Error deleting task', err);
                dispatch(
                    taskActions.setError(
                        'Failed to delete task. Please try again.'
                    )
                );
            }
        }
    };

    // Toggle task completion status
    const toggleTaskCompletion = async (taskId) => {
        try {
            const response = await apiService.tasks.update(taskId, {
                completed: !state.tasks[taskId].completed,
            });

            // console.log('Response from API:', response)
            dispatch(taskActions.updateTask(response.data.data));
        } catch (err) {
            console.error('Error updating task', err);
            // console.log('Error response:', err.response?.data)
            dispatch(
                taskActions.setError(
                    'Failed to update task completion status. Please try again.'
                )
            );
        }
    };

    // Handle form submission success
    const handleFormSuccess = (task) => {
        if (state.editingTask) {
            // UPDATE TASK in list
            dispatch(taskActions.updateTask(task));
        } else {
            // Add NEW TASK to list
            dispatch(taskActions.addTask(task));
        }
        console.log('Data:', state.data);
        console.log('Tasks:', state.tasks);
    };

    // UI Actions
    const showNewTaskForm = (parentId = null) => {
        dispatch(taskActions.hideForm());
        dispatch(taskActions.showForm(parentId));
    };

    const editTask = (taskId) => dispatch(taskActions.setEditingTask(taskId));

    const cancelForm = () => dispatch(taskActions.hideForm());

    const clearError = () => dispatch(taskActions.setError(''));

    // Return actions
    return {
        // API Actions
        getTasks,
        deleteTask,
        toggleTaskCompletion,
        handleFormSuccess, // task creation and updates

        // UI Actions
        editTask,
        cancelForm,
        showNewTaskForm,
        clearError,
    };
};
