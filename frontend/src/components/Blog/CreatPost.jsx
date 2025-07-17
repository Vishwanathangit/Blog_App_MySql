import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '1', // Default to first hardcoded category
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState([
    { id: '1', name: 'Technology' },
    { id: '2', name: 'Lifestyle' },
    { id: '3', name: 'Travel' },
    { id: '4', name: 'Food' },
  ]); // Hardcoded fallback categories
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const navigate = useNavigate();
  const { token } = useAuth();

  // Fetch categories on component mount with fallback
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/posts/categories');
        if (response.data && response.data.length > 0) {
          setCategories(response.data);
          setFormData(prev => ({ ...prev, categoryId: response.data[0].id }));
        }
      } catch (err) {
        setError('Failed to fetch categories from server. Using default categories.');
        console.error('Category fetch error:', err);
      } finally {
        setIsCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'categoryId' ? Number(value) : value,
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required.');
      setIsLoading(false);
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required.');
      setIsLoading(false);
      return;
    }

    if (!formData.categoryId || isCategoriesLoading) {
      setError('Please wait for categories to load or select a category.');
      setIsLoading(false);
      return;
    }

    if (!token) {
      setError('You must be logged in to create a post.');
      setIsLoading(false);
      return;
    }

    const submitData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      categoryId: Number(formData.categoryId),
      tags: formData.tags.filter(tag => tag.trim().length > 0),
    };

    try {
      const response = await api.post('/posts', submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      navigate('/', { state: { success: true } });
    } catch (err) {
      if (err.response) {
        const { status, data } = err.response;
        if (status === 400 && data.message === 'Invalid category ID') {
          setError('Selected category is invalid. Please choose a different one.');
        } else if (status === 401) {
          setError('You must be logged in to create a post. Please log in again.');
        } else {
          setError(data.message || `Server error: ${status}`);
        }
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Post</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-md shadow-sm mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg space-y-6">
        <div>
          <label htmlFor="title" className="block text-gray-800 font-medium mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Enter post title"
            required
            disabled={isLoading || isCategoriesLoading}
            maxLength={255}
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-gray-800 font-medium mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={8}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y"
            placeholder="Write your post content here..."
            required
            disabled={isLoading || isCategoriesLoading}
            maxLength={10000}
          />
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-gray-800 font-medium mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            disabled={isLoading || isCategoriesLoading || categories.length === 0}
            required
          >
            {isCategoriesLoading ? (
              <option value="">Loading categories...</option>
            ) : categories.length === 0 ? (
              <option value="">No categories available</option>
            ) : (
              categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-gray-800 font-medium mb-2">Tags</label>
          <div className="flex mb-3">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Add a tag and press Enter"
              disabled={isLoading || isCategoriesLoading}
              maxLength={50}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || isCategoriesLoading || !tagInput.trim()}
            >
              Add
            </button>
          </div>

          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center bg-gray-100 px-3 py-1 rounded-full shadow-sm text-sm"
                >
                  <span className="mr-2 text-gray-700">#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-gray-400 hover:text-red-500 focus:outline-none"
                    disabled={isLoading || isCategoriesLoading}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || isCategoriesLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || isCategoriesLoading}
          >
            {isLoading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;