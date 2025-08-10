import React, { useState, memo } from 'react';
import { useOrganizers } from '../context/OrganizersContext';

const TaskFilter = ({ onFilterChange, onSort }) => {
    console.log('TaskFilter rendered!');
    const sortingOptions = [
        { id: 0, value: 'dueDate-asc', text: 'Due Date' },
        { id: 1, value: 'createdAt-desc', text: 'Recently Added' },
        { id: 2, value: 'categoryPriority-asc', text: 'Category Priority' },
        { id: 3, value: 'duration-asc', text: 'Shortest Duration' },
        { id: 4, value: 'duration-desc', text: 'Longest Duration' },
        { id: 5, value: 'numOfSubtasks-desc', text: 'Most Subtasks' },
        { id: 6, value: 'numOfSubtasks-asc', text: 'Least Subtasks' },
    ];
    const [sortBy, setSortBy] = useState(sortingOptions[0].value);
    const [filters, setFilters] = useState({
        search: '',
        status: 'all', // 'all', 'incomplete', 'completed'
        categories: [], // empty => no filter
        tags: [], // empty => no filter; tags[0]=== -1 => filter out untagged
        dueDate: 'all', // 'all', 'overdue', 'today', 'thisWeek','future', 'none'
        applyFilters: true, // to let TaskList know to apply filters or to clear filteredTasks
        quickSearch: false, // trigger search only, without applying filters
    });

    const organizers = useOrganizers();
    const { tags, categories } = organizers;

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSort = (e) => {
        setSortBy(e.target.value);
    };

    const handleSearch = (e) => {
        setFilters((prev) => ({
            ...prev,
            search: e.target.value,
        }));
        onFilterChange({ search: e.target.value, quickSearch: true });
    };

    const handleSelectChange = (e) => {
        const name = e.target.name;
        const options = [...e.target.selectedOptions];

        const values = options.reduce((accumulator, option) => {
            option.value === '-1'
                ? accumulator.unshift(+option.value) // put in the beginning of array for easy checks
                : accumulator.push(+option.value);

            return accumulator;
        }, []);
        console.log('Selected values changed:', values);
        console.log('taggedONLY?', values[0] === -1);

        setFilters({ ...filters, [name]: values });
    };

    const clearFilters = () => {
        // reset filters
        setFilters({
            search: '',
            status: 'all',
            categories: [],
            tags: [],
            dueDate: 'all',
            applyFilters: true,
            quickSearch: false,
        });
        // And have TaskList component clear filteredTasks
        onFilterChange({ ...filters, applyFilters: false });
    };

    if (organizers.loading) {
        return <div>Loading filters...</div>;
    }

    return (
        <div className="p-4">
            <div className='flex items-center justify-center'>
                <h3>Filter Tasks</h3>
            </div>
            <p className={`error ${!organizers.error && 'hidden'}`}>{organizers.error}</p>
            
            <div className='bg-amber-50 flex flex-col gap-4 text-gray-700 p-4 rounded-md border border-gray-300'>
                {/* Search */}
                <div>
                    <label htmlFor="search" className='block'>Search</label>
                    <input className='w-full px-3 py-1 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent'
                        id="search"
                        name="search"
                        value={filters.search}
                        onChange={handleSearch}
                        placeholder="Search by title or description"
                    />
                </div>
                <hr className='text-gray-400' />

                {/* Sort */}
                <div className="flex items-center space-x-2">
                    <label htmlFor="sortBy">Sort By</label>
                    <select className='input'
                        id="sortBy"
                        name="sortBy"
                        value={sortBy}
                        onChange={handleSort}
                    >
                        {sortingOptions.map((option) => (
                            <option
                                key={option.id}
                                value={option.value}
                            >
                                {option.text}
                            </option>
                        ))}
                    </select>
                    <button className='btn '
                        onClick={() => onSort(sortBy)}
                    >
                        Sort
                    </button>
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
                {/* Category filter */}
                <div className="flex flex-col space-y-2">
                    <label htmlFor='categories'>Categories</label>
                        <select className='min-h-28 w-full px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-300'
                            multiple
                            id="categories"
                            name="categories"
                            value={filters.categories}
                            onChange={handleSelectChange}
                        >
                            {categories.map((cat) => (
                                <option className='mb-[1px] py-0.5 px-2 rounded-md hover:bg-teal-100'
                                    key={cat.id}
                                    value={cat.id}
                                >
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    
                </div>
                
                {/* Tag filter */}
                <div className={`flex flex-col space-y-2 ${(!tags || tags.length === 0) && 'hidden'}`}>
                    <label htmlFor='tags' className=''>Tags</label>
                    <select className='min-h-28 w-full px-3 py-1 text-sm border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-300'
                        multiple
                        id="tags"
                        name="tags"
                        value={filters.tags}
                        onChange={handleSelectChange}
                    >
                        <option value={'-1'} className='mb-[1px] py-0.5 px-2 hover:bg-teal-100 rounded-md'>Tagged Only</option>
                        {tags.map((tag) => (
                            <option className='mb-[1px] py-0.5 px-2 hover:bg-teal-100 rounded-md'
                                key={tag.id}
                                value={tag.id}
                            >
                                #{tag.name}
                            </option>
                        ))}
                    </select>
                    
                </div>

                {/* Buttons */}
                <div>
                    <button className="btn text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 ring-0"
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>

                    <button className="btn text-sm font-medium ring-0 "
                        onClick={() => onFilterChange(filters)}
                    >
                        Apply
                    </button>
                </div>
                
            </div>

        </div>
    );
};

export default memo(TaskFilter);
