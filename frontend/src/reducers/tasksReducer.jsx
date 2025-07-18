
// Initial state
export const initialState = {
  tasks: {},
  data: {
    total_count: 0,
    parent_count: 0,
    incomplete_count: 0,
    complete_count: 0,
    incomplete_tasks: [],
    complete_tasks: [],
  },
  loading: true,
  error: '',
  showForm: false,
  editingTask: null,
  linkingParent: null
};

// Action creators
export const taskActions = {
    setLoading: (loading) => ({ type: 'SET_LOADING', loading }),
    setError: (error) => ({ type: 'SET_ERROR', error }),
    showForm: (parentId) => ({ type: 'SHOW_FORM', parentId }),
    hideForm: () => ({ type: 'HIDE_FORM' }),
    setEditingTask: (id) => ({ type: 'SET_EDITING_TASK', id }),

    setTasks: (data) => ({ type: 'SET_TASKS', data }),
    addTask: (task) => ({ type: 'ADD_TASK', task }),
    updateTask: (task) => ({ type: 'UPDATE_TASK', task }),
    deleteTask: (id, subtasksData={}, keepSubtasks=true) => ({ type: 'DELETE_TASK', id, subtasksData, keepSubtasks })
};


// Helper Functions

const addParentTask = (state, task) => {
    let newData = {
        ...state.data,
        total_count: state.data.total_count +1,
        parent_count: state.data.parent_count +1
    };

    if (task.completed) {
        newData.complete_count++;
        newData.complete_tasks = [task.id, ...newData.complete_tasks];        
    } else {
        newData.incomplete_count++;
        newData.incomplete_tasks = [task.id, ...newData.incomplete_tasks];
    }

    return {
        tasks: { ...state.tasks, [task.id]: task },
        data: newData
    };
};

const addSubtask = (state, task) => {
    const parentTask = state.tasks[task.parent_task];
    const updatedParent = {
        ...parentTask,
        has_subtasks: true,
        sub_tasks: [...(parentTask.sub_tasks || []), task.id]
    };

    return {
        tasks: {
            ...state.tasks,
            [task.id]: task,
            [task.parent_task]: updatedParent
        },
        data: {
            ...state.data,
            total_count: state.data.total_count +1
        }
    };
};

const updateTaskCompletion = (state, newTask, oldTask) => {
    // Only handle completion changes for parent tasks
    if (newTask.parent_task || oldTask.completed === newTask.completed) {
        return {
            tasks: { ...state.tasks, [newTask.id]: newTask },
            data: state.data
        };
    }

    let newData = { ...state.data };

    if (newTask.completed) {
        // Task marked complete
        newData.incomplete_count--;
        newData.complete_count++;
        newData.incomplete_tasks = newData.incomplete_tasks.filter(id => id !== newTask.id);
        newData.complete_tasks = [newTask.id, ...newData.complete_tasks];
    } else {
        // Task marked incomplete
        newData.incomplete_count++;
        newData.complete_count--;
        newData.complete_tasks = newData.complete_tasks.filter(id => id !== newTask.id);
        newData.incomplete_tasks = [newTask.id, ...newData.incomplete_tasks];
    }

    return {
        tasks: { ...state.tasks, [newTask.id]: newTask },
        data: newData
    };
};

const deleteParentTask = (state, taskId, subtasksData, keepSubtasks) => {
    const taskToDelete = state.tasks[taskId];
    let newTasks = { ...state.tasks };
    delete newTasks[taskId];

    let newData = {
        ...state.data,
        total_count: state.data.total_count -1,
        parent_count: state.data.parent_count -1
    };

    // Remove from completion lists
    if (taskToDelete.completed) {
        newData.complete_count--;
        newData.complete_tasks = newData.complete_tasks.filter(id => id !== taskId);
    } else {
        newData.incomplete_count--;
        newData.incomplete_tasks = newData.incomplete_tasks.filter(id => id !== taskId);
    }

    // Handle subtasks
    if (taskToDelete.has_subtasks) {
        if (keepSubtasks) {
            const result = promoteSubtasks(newTasks, newData, subtasksData);
            newTasks = result.tasks;
            newData = result.data;
        } else {
            const result = deleteAllSubtasks(newTasks, newData, subtasksData.deleted_subtasks);
            newTasks = result.tasks;
            newData = result.data;
        }
    }

    return { tasks: newTasks, data: newData };
};

const deleteSubtask = (state, taskId) => {
    const taskToDelete = state.tasks[taskId];
    let newTasks = { ...state.tasks };
    delete newTasks[taskId];

    let parentTask = newTasks[taskToDelete.parent_task];
    parentTask.sub_tasks = parentTask.sub_tasks.filter(id => id !== taskId);
    parentTask.has_subtasks = parentTask.sub_tasks.length > 0;

    return {
        tasks: { ...newTasks,  [parentTask.id]: parentTask },
        data: { ...state.data, total_count: state.data.total_count-1 }
    };
};

const promoteSubtasks = (tasks, data, subtasksData) => {
    let newTasks = { ...tasks, ...subtasksData.tasks };
    let newData = {
        ...data,
        parent_count: data.parent_count + subtasksData.sub_count,
        incomplete_count: data.incomplete_count + subtasksData.incomplete_count,
        complete_count: data.complete_count + subtasksData.complete_count,
        incomplete_tasks: [ ...data.incomplete_tasks, ...(subtasksData.incomplete_tasks || []) ],
        complete_tasks: [ ...data.complete_tasks, ...(subtasksData.complete_tasks || []) ]
    };

    return { tasks: newTasks, data: newData };
};

const deleteAllSubtasks = (tasks, data, subtaskIds) => {
    let newTasks = { ...tasks };
    let newData = { ...data, total_count: data.total_count - subtaskIds.length};

    subtaskIds.forEach(id => { 
        delete newTasks[id]; 
    });

    return { tasks: newTasks, data: newData };
};


// Main Reducer Function
export function tasksReducer(state, action) {
    switch (action.type) {
        case 'SET_LOADING': {
            return { ...state, loading: action.loading };
        }

        case 'SET_ERROR': {
            return { ...state, error: action.error, loading: false };
        }

        case 'SHOW_FORM': {
            return { ...state, showForm: true, editingTask: null, linkingParent: action.parentId };
        }

        case 'HIDE_FORM': {
            return { ...state, showForm: false, editingTask: null, linkingParent: null };
        }
        
        case 'SET_EDITING_TASK': {
            return { ...state, editingTask: action.id, linkingParent: null, showForm: true };
        }
        
        case 'SET_TASKS': {
            const {tasks, ...relatedData} = action.data;
            return {
                ...state,
                tasks: tasks,
                data: relatedData,
                loading: false,
                error: ''
            };
        }

        case 'ADD_TASK':{
            const result = action.task.parent_task
                ? addSubtask(state, action.task)
                : addParentTask(state, action.task)
                
            return {
                ...state,
                showForm: false,
                editingTask: null,
                linkingParent: null,
                ...result
            };
        }
        
        case 'UPDATE_TASK': {
            const oldTask = state.tasks[action.task.id];
            const result = updateTaskCompletion(state, action.task, oldTask);
            return {
                ...state,
                showForm: false,
                editingTask: null,
                linkingParent: null,
                ...result
            };
        }

        case 'DELETE_TASK': {
            const taskToDelete = state.tasks[action.id];
            const result = taskToDelete.parent_task
                ? deleteSubtask(state, action.id)
                : deleteParentTask(state, action.id, action.subtasksData, action.keepSubtasks);

            return { ...state, ...result };
        }

        default:
        throw new Error(`Unkown action: ${action.type}`);
    }  
};

