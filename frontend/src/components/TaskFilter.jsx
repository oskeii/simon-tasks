import React, { useState, memo } from 'react'
import { useOrganizers } from '../context/OrganizersContext';

const TaskFilter = ({ onFilterChange, onSort }) => {
    console.log('TaskFilter rendered!')
    const sortingOptions = [
        {id: 0, value: 'dueDate-asc', text: 'Due Date'},
        {id: 1, value: 'createdAt-desc', text: 'Recently Added'},
        {id: 2, value: 'categoryPriority-asc', text: 'Category Priority'},
        {id: 3, value: 'duration-asc', text: 'Shortest Duration'},
        {id: 4, value: 'duration-desc', text: 'Longest Duration'},
        {id: 5, value: 'numOfSubtasks-desc', text: 'Most Subtasks'},
        {id: 6, value: 'numOfSubtasks-asc', text: 'Least Subtasks'}
    ]
    const [sortBy, setSortBy] = useState(sortingOptions[0].value);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all', // 'all', 'incomplete', 'completed'
        categories: [], // empty => no filter
        tags: [], // empty => no filter; tags[0]=== -1 => filter out untagged
        dueDate: 'all', // 'all', 'overdue', 'today', 'thisWeek','future', 'none'
        applyFilters: true, // to let TaskList know to apply filters or to clear filteredTasks
        quickSearch: false // trigger search only, without applying filters
    });
    
    const organizers = useOrganizers();
    const { tags, categories } = organizers;

    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSort = (e) => {
        setSortBy(e.target.value);
    }
    
    const handleSearch = (e) => {
        setFilters(prev => ({
            ...prev,
            search: e.target.value
        }));
        onFilterChange({ search: e.target.value, quickSearch: true });
    }

    const handleSelectChange = (e) => {
        const name = e.target.name;
        const options = [...e.target.selectedOptions];

        const values = options.reduce((accumulator, option) => {
            option.value === '-1'
                ? accumulator.unshift(+option.value) // put in the beginning of array for easy checks
                : accumulator.push(+option.value);

            return accumulator
        }, [])
        console.log('Selected values changed:', values)
        console.log('taggedONLY?', values[0] === -1)

        setFilters({ ...filters, [name]: values });
    }

    const clearFilters = () => {
        // reset filters
        setFilters({
            search: '',
            status: 'all',
            categories: [],
            tags: [],
            dueDate: 'all',
            applyFilters: true,
            quickSearch: false
        });
        // And have TaskList component clear filteredTasks
        onFilterChange({...filters, applyFilters: false});
    };

    if (organizers.loading) {
        return <div className='filter-loading'>Loading filters...</div>;
    }

    return (
        <div className='task-filter'> 
            <h3>Filter Tasks</h3>

            {organizers.error && <p className='error'>{organizers.error}</p>}
            <div className='search-section'>
                <label htmlFor='search'>Search</label>
                <input
                    type='text'
                    id='search'
                    name='search'
                    value={filters.search}
                    onChange={handleSearch}
                    placeholder='Search by title or description'
                />
            </div> <hr/>
            <div className='sort-section'>
                <label htmlFor='sortBy'>Sort By</label>
                <select
                    id='sortBy'
                    name='sortBy'
                    value={sortBy}
                    onChange={handleSort}
                >
                    {sortingOptions.map(option => (
                        <option key={option.id} value={option.value}>{option.text}</option>
                    ))}
                </select>
                <button onClick={() => onSort(sortBy)} className='sort-btn'>Sort</button>
            </div>

            {/* <div className='filter-section'>
                <label htmlFor='status'>Status</label>
                <select
                    id='status'
                    name='status'
                    value={filters.status}
                    onChange={handleFilterChange}
                >
                    <option value='all'>All</option>
                    <option value='completed'>Completed</option>
                    <option value='incomplete'>Incomplete</option>
                </select>
            </div>*/}

            {/* <div className='filter-section'>
                <label htmlFor='dueDate'>Due Date</label>
                <select
                    id='dueDate'
                    name='dueDate'
                    value={filters.dueDate}
                    onChange={handleFilterChange}
                >
                    <option value='none'>No Due Date</option>
                    <option value='all'>All</option>
                    <option value='overdue'>Overdue</option>
                    <option value='today'>Due Today</option>
                    <option value='thisWeek'>Due This Week</option>
                    <option value='future'>Future</option>
                </select>
            </div> */}

            <div className='filter-section'>
                <label>
                    Categories
                    <select className='category-filter-options'
                        multiple
                        id='categories'
                        name='categories'
                        value={filters.categories}
                        onChange={handleSelectChange}
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </label>

            </div>

            {tags && tags.length > 0 && (
                <div className='filter-section'>
                    <label>
                        Tags
                        <select className='tag-filter-options'
                            multiple
                            id='tags'
                            name='tags'
                            value={filters.tags}
                            onChange={handleSelectChange}
                        >
                            <option value={'-1'}>Tagged Only</option>
                            {tags.map(tag => (
                                <option key={tag.id} value={tag.id}>#{tag.name}</option>
                            ))}
                        </select>
                    </label>
                </div>
            )}  

            <button onClick={clearFilters} className='clear-filters-btn'>
                Clear Filters
            </button>
            <button onClick={() => onFilterChange(filters)} className='apply-filters-btn'>
                Apply
            </button>
        </div>
    );
};

export default memo(TaskFilter);