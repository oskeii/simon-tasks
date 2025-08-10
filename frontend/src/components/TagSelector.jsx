import React, { useState, useRef, useEffect, useMemo, memo } from 'react';
import { X, Plus } from 'lucide-react';
import {
    useOrganizers,
    useOrganizersManager,
} from '../context/OrganizersContext';
import { useTasks } from '../context/TasksContext';

const TagSelector = ({ onTagsChange }) => {
    console.log('TagSelector rendered!');
    // Get tags associated with editing task (if any) to set as currently selected tags
    const state = useTasks();
    const { editingTask } = state; // task ID
    let editingTags = editingTask ? state.tasks[editingTask].tags : [];
    console.log('Editing Task?', editingTask, 'Editing Tags', editingTags);
    // Get available tags
    const organizers = useOrganizers();
    const { addTag } = useOrganizersManager();
    const { tags } = organizers; // available tags

    const [selectedTags, setSelectedTags] = useState(
        editingTask ? tags.filter((tag) => editingTags.includes(tag.id)) : []
    );
    const [inputValue, setInputValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    const partialMatch = (tagName) => {
        return tagName.toLowerCase().includes(inputValue.trim().toLowerCase());
    };

    // Set of selected tag IDs for O(1) lookups
    const selectedTagIds = useMemo(
        () => new Set(selectedTags.map((tag) => tag.id)),
        [selectedTags]
    );
    // Filter tags based on input
    const filteredTags = useMemo(() => {
        if (!inputValue.trim()) {
            // Return all non-selected tags available
            return tags.filter((tag) => !selectedTagIds.has(tag.id));
        } else {
            // Return all non-selected tags available that also match input
            return tags.filter(
                (tag) => !selectedTagIds.has(tag.id) && partialMatch(tag.name)
            );
        }
    }, [inputValue, selectedTagIds, tags]);

    console.log('Selected Tags:', selectedTagIds, selectedTags);
    useEffect(
        () => console.log('Filtered Tags:', filteredTags),
        [filteredTags]
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

    const handleTagSelect = (tag) => {
        onTagsChange([...selectedTagIds, tag.id]);

        setSelectedTags([...selectedTags, tag]);
        setInputValue('');
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    const handleCreateNewTag = async () => {
        // checking if there's input seems a bit redundant
        if (inputValue.trim() && !exactMatch) {
            // send tag name in API call to create tag
            let tagName = inputValue.trim();
            const newTag = await addTag({ name: tagName });

            if (!newTag)
                inputRef.current?.focus(); // error occured
            else {
                handleTagSelect(newTag);
            }
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setSelectedTags(
            selectedTags.filter((tag) => tag.id !== tagToRemove.id)
        );
    };

    const handleKeyDown = (e) => {
        switch (e.key) {
            case 'Enter': {
                e.preventDefault();
                if (filteredTags.length > 0) {
                    handleTagSelect(filteredTags[0]);
                } else if (inputValue.trim()) {
                    handleCreateNewTag();
                }
                break;
            }

            case 'Backspace': {
                if (inputValue === '' && selectedTags.length > 0) {
                    handleRemoveTag(selectedTags.at(-1));
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

    const exactMatch = tags.some(
        (tag) => tag.name.toLowerCase() === inputValue.trim().toLowerCase()
    );

    return (
        <div className='w-full max-w-md my-1'>
            <label className='block text-gray-700'>Tags</label>
            {organizers.error && <p className="error">{organizers.error}</p>}

            <div className="relative" ref={dropdownRef}>
                {/* Input container with selected tags */}
                {/* w-full px-3 py-1 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent */}
                <div className='w-full px-3 py-1 bg-gray-50 border border-gray-300 rounded-md flex flex-wrap gap-1 items-center focus-within:ring-teal-500 focus-within:border-teal-500'>
                    {selectedTags.map((tag) => (
                        <span key={tag.id} className='inline-flex items-center gap-1 bg-teal-100 text-teal-800 px-1 py-0.5 rounded-full text-sm'>
                            {tag.name}
                            <button className='hover:bg-teal-200 rounded-full p-0.5'
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}

                    <input className='flex-1 min-w-[120px] outline-none bg-transparent'
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            selectedTags.length === 0
                                ? 'Type to search or create tags...'
                                : ''
                        }
                    />
                </div>

                {/* Dropdown */}
                {showDropdown && (
                    <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto'>
                        {filteredTags.length > 0 && (
                            <div>
                                {filteredTags.map((tag) => (
                                    <button className='w-full text-left px-3 py-0.5 hover:bg-gray-100 focus:bg-gray-200 focus:outline-none'
                                        key={tag.id}
                                        type="button"
                                        onClick={() => handleTagSelect(tag)}
                                    >
                                        #{tag.name}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Create new tag option */}
                        {inputValue.trim() && !exactMatch && (
                            <button className='w-full text-left px-3 py-1 hover:bg-emerald-50 focus:bg-emerald-50 focus:outline-none text-emerald-700 border-t border-gray-200'
                                type="button"
                                onClick={handleCreateNewTag}
                            >
                                <div className='flex items-center gap-2'>
                                    <Plus size={16} />
                                    Create "{inputValue.trim()}"
                                </div>
                            </button>
                        )}

                        {/* All available tags selected */}
                        {filteredTags.length === 0 && !inputValue.trim() && (
                            <div className='px-3 py-1 text-gray-500'>No more tags available</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TagSelector;
