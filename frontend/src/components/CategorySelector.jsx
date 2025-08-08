import React, { useState, useRef, useEffect, useMemo, memo } from 'react';
import { X, Plus } from 'lucide-react';
import {
    useOrganizers,
    useOrganizersManager,
} from '../context/OrganizersContext';
import { useTasks } from '../context/TasksContext';

const CategorySelector = ({ onSelect }) => {
    console.log('CategorySelector rendered!');

    // Get available categories
    const organizers = useOrganizers();
    const state = useTasks();
    const { editingTask } = state;

    const { addCategory } = useOrganizersManager();
    const { categories } = organizers; // available categories
    console.log(categories)

    const [selection, setSelection] = useState(editingTask ? categories.find((cat) => cat.id === state.tasks[editingTask].category) : null);

    const [inputValue, setInputValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    const partialMatch = (catName) => {
        return catName.toLowerCase().includes(inputValue.trim().toLowerCase());
    };

    // Filter categories based on input
    const filteredCategories = useMemo(() => {
        if (!inputValue.trim()) {
            // Return all available categories
            return categories.filter((cat) => cat !== selection);
        } else {
            // Return all available categories that also match input
            return categories.filter(
                (cat) => cat !== selection && partialMatch(cat.name)
            );
        }
    }, [inputValue, selection, categories]);

    console.log('Selected Category:', selection);
    useEffect(
        () => console.log('Filtered Categories:', filteredCategories),
        [filteredCategories]
    );

    // Handle clicking outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        setShowDropdown(true);
    };

    const handleInputFocus = () => {
        setShowDropdown(true);
    };

    const handleSelect = (category) => {
        onSelect(category.id);

        setSelection(category);
        setInputValue('');
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    const handleCreateNewCategory = async () => {
        // checking if there's input seems a bit redundant
        if (inputValue.trim() && !exactMatch) {
            // send tag name in API call to create tag
            let categoryName = inputValue.trim();
            const newCategory = await addCategory({ name: categoryName });

            if (!newCategory)
                inputRef.current?.focus(); // error occured
            else {
                handleSelect(newCategory);
            }
        }
    };

    const handleClearSelection = () => {
        onSelect(null);
        setSelection(null);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        switch (e.key) {
            case 'Enter': {
                e.preventDefault();
                if (filteredCategories.length > 0) {
                    handleSelect(filteredCategories[0]);
                } else if (inputValue.trim()) {
                    handleCreateNewCategory();
                }
                break;
            }

            case 'Backspace': {
                if (inputValue === '' && selection) {
                    handleClearSelection();
                }
                break;
            }

            case 'Tab':
            case 'Escape': {
                setShowDropdown(false);
                break;
            }
        }
    };

    const exactMatch = categories.some(
        (cat) => cat.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

    return (
        <div className="flex items-center gap-3 w-full max-w-md my-1">
            <label className='block text-gray-700'>Category</label>
            {organizers.error && <p className="error">{organizers.error}</p>}
            
            <div className="relative w-full" ref={dropdownRef}>
                <div className='px-3 py-1 bg-gray-50 border border-gray-300 rounded-md flex flex-wrap gap-0.5 focus-within:ring-indigo-500 focus-within:border-indigo-500'>
                    {selection && (
                        <span className='inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 px-1 py-0.5 rounded-full text-sm'>
                            {selection.name}
                            <button className='hover:bg-gray-200 rounded-full p-0.5'
                                type="button"
                                onClick={handleClearSelection}
                            >
                                <X size={12} />
                            </button>
                        </span>
                    )}

                    <input className='flex-1 min-w-[120px] outline-none bg-transparent'
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onKeyDown={handleKeyDown}
                        placeholder={selection ? '' : 'Type to search or create a category...'}
                    />
                </div>

                {/* Dropdown */}
                {showDropdown && (
                    <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto'>
                        {filteredCategories.length > 0 && (
                            <div>
                                {filteredCategories.map((cat) => (
                                    <button className='w-full text-left px-3 py-0.5 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none'
                                        key={cat.id}
                                        type="button"
                                        onClick={() => handleSelect(cat)}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Create new tag option */}
                        {inputValue.trim() && !exactMatch && (
                            <button className='w-full text-left px-3 py-1 hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none text-emerald-700 border-t border-gray-200'
                                type="button"
                                onClick={handleCreateNewCategory}
                            >
                                <div className='flex items-center gap-2'>
                                    <Plus size={16} />
                                    Create "{inputValue.trim()}"
                                </div>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default CategorySelector;
