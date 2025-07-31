import React, { useState, useRef, useEffect, useMemo, memo } from 'react';
import { X, Plus } from 'lucide-react';
import {
    useOrganizers,
    useOrganizersManager,
} from '../context/OrganizersContext';

const CategorySelector = ({ currentSelection = null, onSelect }) => {
    console.log('CategorySelector rendered!');

    // Get available categories
    const organizers = useOrganizers();
    const { addCategory } = useOrganizersManager();
    const { categories } = organizers; // available categories

    const [selection, setSelection] = useState(
        currentSelection
            ? categories.find((cat) => cat.id === currentSelection)
            : null
    );
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
        <div className="category-selector">
            <h2>Category Selector</h2>
            {organizers.error && <p className="error">{organizers.error}</p>}
            <div
                className="input-container"
                ref={dropdownRef}
            >
                <div>
                    {selection && (
                        <span>
                            {selection.name}
                            <button
                                type="button"
                                onClick={handleClearSelection}
                            >
                                {' '}
                                <X size={12} />{' '}
                            </button>
                        </span>
                    )}

                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onKeyDown={handleKeyDown}
                        placeholder={'Type to search or create a category...'}
                    />
                </div>

                {/* Dropdown */}
                {showDropdown && (
                    <div>
                        {filteredCategories.length > 0 && (
                            <div>
                                {filteredCategories.map((cat) => (
                                    <button
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
                            <button
                                type="button"
                                onClick={handleCreateNewCategory}
                            >
                                <div>
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
