import React, { useEffect, useState } from 'react';
import TaskForm from '../components/TaskForm';
import TaskItem from '../components/TaskItem';
import TaskFilter from '../components/TaskFilter';
import { useTasksManager, useTasks } from '../context/TasksContext';
import { useOrganizersManager } from '../context/OrganizersContext';

const TaskList = () => {
    console.log('TaskList rendered!');

    const [toggleCompleteList, setToggleCompleteList] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filteredTasks, setFilteredTasks] = useState(null);
    const [activeFilters, setActiveFilters] = useState({
        search: '',
        status: 'all', // 'all', 'incomplete', 'completed'
        categories: [], // empty => no filter
        tags: [], // empty => no filter ; tags[0]==='-1' => "filter out untagged tasks"
        dueDate: 'all', // 'all', 'overdue', 'today', 'thisWeek','future', 'none'
        applyFilters: false, // to let TaskList know to apply filters or to clear filteredTasks
        quickSearch: false, // trigger search only, without applying filters
    });

    const state = useTasks();
    const { tasks, data } = state;
    console.log('LOCAL TASKS SET:', tasks);
    console.log('LOCAL DATA:', data);
    // console.log('editing:', state.editingTask)
    // console.log('linking parent:', state.linkingParent)

    const { getTags, getCategories } = useOrganizersManager();
    const { getTasks, showNewTaskForm, cancelForm } = useTasksManager();

    /** Custom built-in function for filtering the object
     * reference: https://www.geeksforgeeks.org/javascript/how-to-implement-a-filter-for-objects-in-javascript/
     */
    Object.filter = (obj, predicate) =>
        Object.fromEntries(
            Object.entries(obj).filter(([key, value]) => predicate(value))
        );

    // Search tasks --> setFilteredTasks(result);
    const search = () => {
        let result = filteredTasks ? { ...filteredTasks } : { ...tasks };
        const searchLower = activeFilters.search.toLowerCase();

        result = Object.filter(result, (task) => {
            let isMatch =
                task.title.toLowerCase().includes(searchLower) ||
                (task.description &&
                    task.description.toLowerCase().includes(searchLower));

            let subtaskIsMatch =
                task.has_subtasks &&
                task.sub_tasks.some(
                    (id) =>
                        result[id].title.toLowerCase().includes(searchLower) ||
                        (result[id].description &&
                            result[id].description
                                .toLowerCase()
                                .includes(searchLower))
                );
            !isMatch &&
                subtaskIsMatch &&
                console.log('MATCH FOUND IN SUBTASK of task ->', task.title);

            return isMatch || subtaskIsMatch;
        });

        setFilteredTasks(result);
        console.log('RESULT:', result);
    };

    // Apply task sorting --> getTasks(sortParams);
    const applySorting = (sortBy) => {
        // split the string to separate sort-by and ordering
        let sort = sortBy.split('-', 2); // [sortByString, orderString]
        console.log('Sorting by...', sort);
        let sortParams = new URLSearchParams();
        sortParams.append('sort_by', sort[0]);
        sortParams.append('sort_by', sort[1]);
        console.log('SORT PARAMS', sortParams);
        getTasks(sortParams);
    };

    // Apply filters to tasks --> let result = {...tasks}; -> setFilteredTasks(result);
    const applyFilters = () => {
        let result = { ...tasks };

        // SORTING
        // Filter by completion status
        // Filter by due date

        // Filter by search term
        if (activeFilters.search) {
            console.log('FILTERING BY SEARCH TERM');
            // search();
            result = { ...filteredTasks };
            // result = Object.filter(result, task => {filteredTasks.includes(task.id)});
        }

        // Filter by category
        if (activeFilters.categories.length > 0) {
            console.log('FILTERING BY CATEGORY');
            result = Object.filter(result, (task) => {
                return (
                    task.category &&
                    activeFilters.categories.includes(task.category)
                );
            });
            console.log('RESULT:', result);
        }

        // Filter by tags
        if (activeFilters.tags.length > 0) {
            console.log('FILTERING BY TAGS');
            // Check if task has no tags OR at least one of the selected tags
            let resultWithUntagged = Object.filter(result, (task) => {
                return (
                    task.tags.length === 0 ||
                    task.tags.some((tagId) =>
                        activeFilters.tags.includes(tagId)
                    )
                );
            });

            result =
                activeFilters.tags[0] === -1 // "filter out untagged tasks"
                    ? Object.filter(
                          resultWithUntagged,
                          (task) => task.tags.length > 0
                      )
                    : resultWithUntagged;

            console.log('RESULT:', result);
        }

        // remove subtasks
        console.log('REMOVING SUBTASKS');
        result = Object.filter(result, (task) => !task.parent_task);
        console.log('RESULT:', result);
        setFilteredTasks(result);
    };

    // Handle filter changes from TaskFilter component --> setActiveFilters OR setFiilteredTasks(null)
    const handleFilterChange = (newFilters) => {
        if (newFilters.quickSearch) {
            // set active filters to trigger quick search
            setActiveFilters((prev) => ({
                ...prev,
                search: newFilters.search,
                quickSearch: true,
            }));
        } else if (!newFilters.applyFilters) {
            // clear filtered tasks
            setFilteredTasks(null);
        } else {
            // set active filters to trigger task filtering
            setActiveFilters(newFilters);
        }
    };

    useEffect(() => {
        getTags();
        getCategories();

        getTasks();
        cancelForm();
    }, []);

    useEffect(() => {
        console.log('UPDATED ACTIVE FILTERS:', activeFilters);
    }, [activeFilters]);

    useEffect(() => {
        if (activeFilters.quickSearch) {
            console.log('QUICK SEARCH');
            search();
        } else if (activeFilters.applyFilters) {
            console.log('APPLYING ACTIVE FILTERS');
            applyFilters();
        }
    }, [tasks, activeFilters]);

    if (state.loading) {
        return <div>Loading tasks...</div>;
    }

    return (
        <div className="task-list-page">
            <div className="task-list-header">
                <h2>My Tasks</h2>
                <hr />

                <div className="task-list-actions">
                    <button onClick={() => showNewTaskForm()}>
                        Add New Task
                    </button>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={showFilters ? 'active' : ''}
                    >
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>
                </div>
            </div>

            {state.error && <p className="error">{state.error}</p>}

            <div>
                {showFilters && (
                    <aside className="task-filters-sidebar">
                        <TaskFilter
                            onFilterChange={handleFilterChange}
                            onSort={applySorting}
                        />
                    </aside>
                )}

                {state.showForm && (
                    <div className="task-form-container">
                        <TaskForm
                            task={tasks[state.editingTask]}
                            parentId={state.linkingParent}
                        />
                    </div>
                )}

                <div className="task-list">
                    {
                        filteredTasks && (
                            <p>
                                {Object.keys(filteredTasks).length} matches
                                found.
                            </p>
                        )
                        // <p>{filteredTasks.length} matches found.</p>
                    }

                    {data.total_count === 0 ? (
                        <p>No tasks yet. Create one to get started!</p>
                    ) : (
                        <>
                            <div className="incomplete-list">
                                <h3>
                                    Incomplete Tasks ({data.incomplete_count})
                                </h3>
                                <ul>
                                    {data.incomplete_tasks.map((tId) => {
                                        // if tasks are filtered, look for task in filteredTasks
                                        const task = filteredTasks // && filteredTasks.includes(tId)
                                            ? filteredTasks[tId] // ? tasks[tId] : null
                                            : tasks[tId];
                                        if (!task) return null;

                                        return (
                                            <li key={tId}>
                                                <TaskItem
                                                    task={task}
                                                    subtasks={
                                                        task.sub_tasks
                                                            ? task.sub_tasks.map(
                                                                  (id) =>
                                                                      tasks[id]
                                                              )
                                                            : []
                                                    }
                                                />
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            <hr />
                            <div className="completed-list">
                                <h3>Complete Tasks ({data.complete_count})</h3>
                                {data.complete_count > 0 && (
                                    <button
                                        onClick={() =>
                                            setToggleCompleteList(
                                                !toggleCompleteList
                                            )
                                        }
                                    >
                                        {toggleCompleteList
                                            ? '▼ Hide'
                                            : '▶ Show'}
                                    </button>
                                )}
                                {toggleCompleteList && (
                                    <ul>
                                        {data.complete_tasks.map((tId) => {
                                            // if tasks are filtered, look for task in filteredTasks
                                            const task = filteredTasks
                                                ? filteredTasks[tId]
                                                : tasks[tId];
                                            if (!task) return null;

                                            return (
                                                <li
                                                    key={tId}
                                                    className="completed"
                                                >
                                                    <TaskItem
                                                        task={task}
                                                        subtasks={
                                                            task.sub_tasks
                                                                ? task.sub_tasks.map(
                                                                      (id) =>
                                                                          tasks[
                                                                              id
                                                                          ]
                                                                  )
                                                                : []
                                                        }
                                                    />
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskList;
