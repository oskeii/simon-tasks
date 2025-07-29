import React, { useState, useRef, useEffect, useMemo, memo } from 'react'
import { X, Plus } from 'lucide-react'
import { useOrganizers, useOrganizersManager } from '../context/OrganizersContext';
import { useTasks } from '../context/TasksContext';

const TagSelector = ({ onTagsChange }) => {
    console.log('TagSelector rendered!')
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
        editingTask ? tags.filter(tag => editingTags.includes(tag.id))
        : []
    );
    const [inputValue, setInputValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    const partialMatch = (tagName) => {
        return tagName.toLowerCase().includes(inputValue.trim().toLowerCase())
    };

    // Set of selected tag IDs for O(1) lookups
    const selectedTagIds = useMemo(() => new Set(selectedTags.map(tag => tag.id)), [selectedTags]);
    // Filter tags based on input
    const filteredTags = useMemo(() => {
        if (!inputValue.trim()) {
            // Return all non-selected tags available
            return tags.filter(tag => !selectedTagIds.has(tag.id));
        } else {
            // Return all non-selected tags available that also match input
            return tags.filter(tag => !selectedTagIds.has(tag.id) && partialMatch(tag.name));
        }
    }, [inputValue, selectedTagIds, tags])
    
    console.log('Selected Tags:', selectedTagIds, selectedTags)   
    useEffect(() => console.log('Filtered Tags:', filteredTags), [filteredTags])
    
    // Handle clicking outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
                
            if (!newTag) inputRef.current?.focus(); // error occured
            else {
                handleTagSelect(newTag);
            }
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setSelectedTags(selectedTags.filter(tag => tag.id !== tagToRemove.id));
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

    const exactMatch = tags.some(tag =>
        tag.name.toLowerCase() === inputValue.trim().toLowerCase()
    );


    return (
        <div className='tag-selector'>
            <h2>Tag Selector</h2>
            {organizers.error && <p className='error'>{organizers.error}</p>}
            <div className='input-container' ref={dropdownRef}>
                {/* Input container with selected tags */}
                <div>
                    {selectedTags.map(tag => (
                        <span key={tag.id}>
                            {tag.name}
                            <button
                                type='button'
                                onClick={() => handleRemoveTag(tag)}
                            >   <X size={12} /> </button>
                        </span>
                    ))}

                    <input
                        ref={inputRef}
                        type='text'
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onKeyDown={handleKeyDown}
                        placeholder={selectedTags.length === 0 ? 'Type to search or create tags...' : ''}
                    />
                </div>

                {/* Dropdown */}
                {showDropdown && (
                    <div>
                        {filteredTags.length > 0 && (
                            <div>
                                {filteredTags.map(tag => (
                                    <button key={tag.id}
                                        type='button'
                                        onClick={() => handleTagSelect(tag)}
                                    >{tag.name}</button>
                                ))}
                            </div>
                        )}

                        {/* Create new tag option */}
                        {inputValue.trim() && !exactMatch && (
                            <button
                                type='button'
                                onClick={handleCreateNewTag}
                            >
                                <div>
                                    {/* <Plus size={16} /> */}
                                    Create "{inputValue.trim()}"
                                </div>
                            </button>
                        )}

                        {/* Tag already exists */}

                        {/* All available tags selected */}
                        {filteredTags.length === 0 && !inputValue.trim() && (
                            <div>No more tags available</div>
                        )}

                    </div>
                )}
            </div>

            {/* Display selected tags */}
            <div>
                <h3>Selected Tags:</h3>
                <div>
                    {selectedTags.length > 0
                        ? selectedTags.map(tag => tag.name).join(', ')
                        : 'None selected'
                    }
                </div>
            </div>
        </div>
    );
};

export default TagSelector;