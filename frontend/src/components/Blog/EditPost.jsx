import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const EditPost = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch post data
        const postResponse = await api.get(`/posts/${id}`);
        const post = postResponse.data;
        setFormData({
          title: post.title,
          content: post.content,
          categoryId: post.CategoryId,
          tags: post.Tags ? post.Tags.map(t => t.name) : [],
        });

        // Fetch categories
        const categoriesResponse = await api.get('/posts/categories');
        setCategories(categoriesResponse.data);
      } catch (err) {
        setError('Failed to load post or categories');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'categoryId' ? Number(value) : value,
    }));
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
    setError(null);
    setLoading(true);

    try {
      const submitData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: Number(formData.categoryId),
        tags: formData.tags.filter(tag => tag.trim().length > 0),
      };

      await api.put(`/posts/${id}`, submitData);
      navigate(`/posts/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating post');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="container mx-auto px-4 py-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-gray-700 font-medium mb-2">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="8"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="categoryId" className="block text-gray-700 font-medium mb-2">Category</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading || categories.length === 0}
            required
          >
            {categories.length === 0 ? (
              <option value="">Loading categories...</option>
            ) : (
              categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="tags" className="block text-gray-700 font-medium mb-2">Tags</label>
          <div className="flex mb-2">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Add a tag"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 transition"
              disabled={loading || !tagInput.trim()}
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.tags.map(tag => (
              <div key={tag} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                <span className="mr-2">{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            disabled={loading}
          >
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;