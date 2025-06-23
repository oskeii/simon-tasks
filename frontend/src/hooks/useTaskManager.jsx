import { useReducer } from "react";
import { taskReducer, initialState, taskActions } from "../reducers/taskReducer";
import useApiService from "../services/apiService";

export const useTaskManager = () => {
    const [state, dispatch] = useReducer(taskReducer, initialState);
    const apiService = useApiService();

    // Fetch tasks
    const getTasks = async () => {
        try {
            dispatch(taskActions.setLoading(true));
            const response = await apiService.tasks.getAll();
            dispatch(taskActions.setTasks(response.data.data));
        } catch (err) {
            console.error('Error fetching tasks:', err);
            dispatch(taskActions.setError('Failed to load tasks. Please try again.'));
        }
    };
    
    const getSubtasks = async (parentId) => {
        try {
            dispatch(taskActions.setLoading(true));
            const response = await apiService.tasks.subtasks(parentId);
            dispatch(taskActions.setTasks(response.data.data));
        } catch (err) {
            console.error('Error fetching tasks:', err);
            dispatch(taskActions.setError('Failed to load subtasks. Please try again.'));
        }
    };

    // Delete task
    const deleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            const task = state.tasks[taskId];
            let delete_subtasks = false;

            if (task && task.has_subtasks) { delete_subtasks = window.confirm('Delete SUBTASKS too?') }
            try {
                const response_data = (
                await apiService.tasks.delete(taskId, { keep_subtasks: !delete_subtasks })
                ).data.data;

                dispatch(taskActions.deleteTask(taskId, response_data, !delete_subtasks))
            } catch (err) {
                console.error('Error deleting task', err);
                dispatch(taskActions.setError('Failed to delete task. Please try again.'));
            }
        }
    };

    // Toggle task completion status
    const toggleTaskCompletion = async (taskId) => {
        try {
            const response = await apiService.tasks.update(taskId, {
                completed: !state.tasks[taskId].completed
            });

            // console.log('Response from API:', response)
            dispatch(taskActions.updateTask(response.data.data))
        } catch (err) {
            console.error('Error updating task', err);
            // console.log('Error response:', err.response?.data)
            dispatch(taskActions.setError('Failed to update task completion status. Please try again.'));
        }
    };

    // Handle form submission success
    const handleFormSuccess = (task) => {
        if (state.editingTask) { // UPDATE TASK in list
            dispatch(taskActions.updateTask(task));
        } else { // Add NEW TASK to list
            dispatch(taskActions.addTask(task)); 
        }
    };

    // UI Actions
    const editTask = (taskId) => dispatch(taskActions.setEditingTask(taskId));

    const cancelForm = () => dispatch(taskActions.hideForm());

    const showNewTaskForm = () => dispatch(taskActions.showForm());

    const clearError = () => dispatch(taskActions.setError(''));

    // Return state and actions
    return {
        // State
        state,
        tasks: state.tasks,
        data: state.data,
        loading: state.loading,
        error: state.error,
        showForm: state.showForm,
        editingTask: state.editingTask,

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

        // Direct dispatch access (for edge cases)
        dispatch
    };

};