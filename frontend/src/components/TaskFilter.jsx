import React, { useEffect, useState } from 'react'
import useApiService from '../services/apiService'
import { useTasksManager } from '../context/TasksContext'
import { useOrganizers, useOrganizersManager } from '../context/OrganizersContext';

const TaskFilter = ({ onFilterChange }) => {
    // const [categories, setCategories] = useState([]);
    // const [tags, setTags] = useState([]); 
    // const [loading, setLoading] = useState(true);
    
    const [filters, setFilters] = useState({
        search: '',
        status: 'all', // 'all', 'incomplete', 'completed'
        categories: [], // empty => select all (no filter)
        tags: [], // empty => select all (no filter)
        noTags: false, // 
        dueDate: 'all', // 'all', 'overdue', 'today', 'thisWeek','future', 'none'
        applyFilters: true, // to let TaskList know to apply filters or to clear filteredTasks
        quickSearch: false // trigger search only, without applying filters
    });
    
    const organizers = useOrganizers();
    const { tags, categories } = organizers;

    const { getTags, getCategories } = useOrganizersManager();

    // 1. (on initial render) fetch tags and categories for filter options
        // *will also need to update these options whenever a new tag or category is created
    useEffect(() => {
        getTags();
        getCategories();
    // error handler?
    }, []);
    // 2. notify parent component when filters change
        // so we can update activeFilters and apply them
        // might need to separate frontend filters and backend filters
        // backend filters should require 'apply' button, to reduce API calls

    
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = (e) => {
        setFilters(prev => ({
            ...prev,
            search: e.target.value
        }));
        onFilterChange({ search: e.target.value, quickSearch: true });
    }

    const handleTagSelection = (tagId=-1) => {
        if (tagId < 0) { // toggle noTags filter
            setFilters(prev => ({ ...prev, noTags: !prev.noTags }));
        } else {
            // add or remove tag from selected tags
            setFilters(prev => {
                const updatedSelection = prev.tags.includes(tagId)
                    ? prev.tags.filter(id => id !== tagId)
                    : [...prev.tags, tagId];
                
                return { ...prev, tags: updatedSelection };
            });
        }
    };

    const handleCategorySelection = (catId) => {
        // add or remove category from selected categories
        setFilters(prev => {
            const updatedSelection = prev.categories.includes(catId)
                ? prev.categories.filter(id => id !== catId)
                : [...prev.categories, catId];
            
            return { ...prev, categories: updatedSelection };
        });
    }

    const clearFilters = () => {
        // reset filters
        setFilters({
            search: '',
            status: 'all',
            categories: [],
            tags: [],
            noTags: false,
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

            <div className='filter-section'>
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
            </div>

            <div className='filter-section'>
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
            </div>

            <div className='filter-section'>
                <label>Category</label>

                <div className='category-filter-options'>

                    {categories.map(cat => (
                        <div key={cat.id} className='category-filter-option'>
                            <label>
                                <input
                                    type='checkbox'
                                    checked={filters.categories.includes(cat.id)}
                                    onChange={() => handleCategorySelection(cat.id)}
                                />
                                {cat.name}
                            </label>
                        </div>
                    ))}
                </div>

            </div>

            {tags && tags.length > 0 && (
                <div className='filter-section'>
                    <label>Tags</label>

                    <div className='tag-filter-options'>
                        <div className='tag-filter-option'>
                            <label>
                                <input
                                    type='checkbox'
                                    checked={filters.noTags}
                                    onChange={() => handleTagSelection()}
                                />
                                No Tags
                            </label>
                        </div>

                        {tags.map(tag => (
                            <div key={tag.id} className='tag-filter-option'>
                                <label>
                                    <input
                                        type='checkbox'
                                        checked={filters.tags.includes(tag.id)}
                                        onChange={() => handleTagSelection(tag.id)}
                                        disabled={filters.noTags}
                                    />
                                    #{tag.name}
                                </label>
                            </div>
                        ))}
                    </div>

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

export default TaskFilter