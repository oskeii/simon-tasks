import React, { useEffect, useState } from 'react';
import useApiService from '../services/apiService';

const TagManager = () => {
    const apiService = useApiService();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tags, setTags] = useState([]);
    const [formData, setFormData] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchTags = async () => {
        try {
            setLoading(true);
            const response = await apiService.tags.get('/tags/');
            setTags(response.data.data);
            setError('');
        } catch (err) {
            console.error('Error fetching tags', err);
            setError('Failed to load tags');
        } finally {
            setLoading(false);
        }
    };

    const deleteTag = async (tagId) => {
        if (
            window.confirm(
                'There are N tasks in this tag\n Are you sure you want to delete this tag?'
            )
        ) {
            try {
                await apiService.tags.delete(tagId);
                setTags(tags.filter((t) => t.id !== tagId));
            } catch (err) {
                console.error('Error deleting tag', err);
                setError('Failed to delete tag. Please try again.');
            }

            if (tagId === editingId) {
                toggleForm();
            }
        }
    };

    const toggleForm = (tag = null) => {
        if (tag) {
            // open form with data to edit
            setEditingId(tag.id);
            setFormData(tag);
            setShowForm(true);
        } else if (showForm) {
            // clear form data and close form
            setEditingId(null);
            setFormData({});
            setShowForm(false);
        } else {
            setShowForm(true);
        } // open form for new task
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setFormData((prev) => ({
                ...prev,
                [name]: checked,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            console.log('Sending data to API:', formData);

            if (editingId) {
                const response = await apiService.tags.update(
                    editingId,
                    formData
                );
                console.log('Response from API:', response);
                let tag = response.data.data;
                setTags(tags.map((t) => (t.id === tag.id ? tag : t)));
            } else {
                const response = await apiService.tags.create(formData);
                console.log('Response from API:', response);
                setTags([...tags, response.data.data]);
            }
        } catch (err) {
            console.error('Error updating/creating tag:', err);
            setError(err.response?.data?.message || 'An error occurred');
        }

        toggleForm(); // clear form data and editingId, close form
    };

    useEffect(() => {
        fetchTags();
    }, []);

    useEffect(() => {
        console.log('Form data updated:', formData);
    }, [formData]);

    if (loading) {
        return <div>Loading tags...</div>;
    }

    return (
        <div className="tag-manager">
            <div>
                <h2>Tags</h2>
                {!showForm && (
                    <button onClick={() => toggleForm()}>Add Tag</button>
                )}
            </div>

            {error && <p className="error">{error}</p>}

            {showForm && (
                <div className="tag-form">
                    <h3>{editingId ? 'Edit Tag' : 'New Tag'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit">
                                {editingId ? 'Update' : 'Create'}
                            </button>
                            <button onClick={() => toggleForm()}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {tags.length === 0 ? (
                <p>
                    No tags created yet. Create one to start organizing your
                    tasks!
                </p>
            ) : (
                <div className="tag-list">
                    <ul>
                        {tags.map((tag) => (
                            <li
                                key={tag.id}
                                className="tag-item"
                            >
                                <div className="tag-info">
                                    <h4>{tag.name}</h4>
                                </div>
                                <div className="tag-actions">
                                    <button onClick={() => toggleForm(tag)}>
                                        Edit
                                    </button>
                                    <button onClick={() => deleteTag(tag.id)}>
                                        Delete{' '}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TagManager;
