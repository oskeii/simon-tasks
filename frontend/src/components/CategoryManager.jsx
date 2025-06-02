import React, { useEffect, useState } from 'react'
import useApiService from '../services/apiService'

const CategoryManager = () => {
  const apiService = useApiService();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiService.categories.get('/categories/');
      setCategories(response.data.data);
      setError('');
    } catch (err) {
      console.error('Error fetching categories', err);
      setError('Failed to load categories');  
    } finally {
        setLoading(false);
    }
  };

  const deleteCat = async (catId) => {
    if (window.confirm('There are N tasks in this category\n Are you sure you want to delete this category?')) {
        try {
            await apiService.categories.delete(catId);
            setCategories(categories.filter(c => c.id !== catId));
        } catch (err) {
            console.error('Error deleting category', err);
            setError('Failed to delete category. Please try again.');
        }

        if (catId === editingId) { toggleForm() }
    }
  };

  const toggleForm = (cat=null) => {
    if (cat) { // open form with data to edit
        setEditingId(cat.id);
        setFormData(cat);  
        setShowForm(true)
    } else if (showForm) { // clear form data and close form
        setEditingId(null);
        setFormData({});
        setShowForm(false);
    } else { setShowForm(true) } // open form for new task
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    }
    else {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
        console.log('Sending data to API:', formData);

        if (editingId) {
            const response = await apiService.categories.update(editingId, formData);
            console.log('Response from API:', response);
            let category = response.data.data
            setCategories(categories.map(c => c.id === category.id ? category : c))
        }
        else {
            const response = await apiService.categories.create(formData);
            console.log('Response from API:', response)
            setCategories([...categories, response.data.data])
        }
    } catch (err) {
        console.error('Error updating/creating category:', err);
        setError(err.response?.data?.message || 'An error occurred');
    }

    toggleForm(); // clear form data and editingId, close form
  };


  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    console.log('Form data updated:', formData);
  }, [formData]);

  if (loading) {
    return (<div>Loading categories...</div>);
  }


  return (
    <div className='category-manager'>
        <div>
            <h2>Task Categories</h2>
            {!showForm && (
                <button onClick={() => toggleForm()}>Add Category</button>
            )}
        </div>

        {error && <p className='error'>{error}</p>}

        {showForm && (
            <div className='category-form'>
                <h3>{editingId ? 'Edit Category' : 'New Category'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className='form-group'>
                        <label htmlFor='name'>Name</label>
                        <input
                        type='text' id='name' name='name'
                        value={formData.name || ''}
                        onChange={handleChange}
                        required
                        />
                    </div>

                    <div className='form-group'>
                        <label htmlFor='description'>Description</label>
                        <textarea
                        id='description' name='description'
                        value={formData.description || ''}
                        onChange={handleChange}
                        />
                    </div>

                    <div className='form-group'>
                        <label>
                            <input 
                            type='checkbox' name='as_workload' 
                            checked={formData.as_workload || true}
                            onChange={handleChange}
                            />
                            Workload?
                        </label>
                    </div>

                    <div className='form-actions'>
                        <button type='submit'>{editingId ? 'Update' : 'Create'}</button>
                        <button onClick={() => toggleForm()}>Cancel</button>
                    </div>
                </form>
            </div>
        )}

        {categories.length === 0 ? (
            <p>No categories created yet. Create one to start organizing your tasks!</p>
        ) : (
            <div className='category-list'>
                <ul>
                    {categories.map(cat => (
                        <li key={cat.id} className='category-item'>
                            <div className='category-info'>
                                <h4>{cat.name}</h4>
                                {cat.description && <p>{cat.description}</p>}
                                <span className='workload-badge'>
                                    {cat.as_workload ? 'counts in workload' : 'not counted in workload'}
                                </span>
                            </div>
                            <div className='category-actions'>
                                <button onClick={() => toggleForm(cat)}>Edit</button>
                                <button onClick={() => deleteCat(cat.id)}>Delete </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            
        )}
    </div>
  )
}

export default CategoryManager