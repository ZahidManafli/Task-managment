import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { refreshKnowledgeBase } from '../../services/aiSearch';
import { useAuth } from '../../hooks/useAuth';

/**
 * AdminKnowledge Component
 * Admin-only page for managing knowledge base
 * Create, read, update, delete Q&A entries
 */
export const AdminKnowledge = () => {
  const { currentUser, isAdmin } = useAuth();
  const [knowledge, setKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    keywords: '',
    category: '',
  });

  // Check admin access
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-xl text-red-600 font-semibold mb-4">
            Access Denied
          </p>
          <p className="text-gray-600">
            Only administrators can access this page.
          </p>
        </div>
      </div>
    );
  }

  // Load knowledge entries
  useEffect(() => {
    const loadKnowledge = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(
          collection(db, 'knowledge_base')
        );
        const data = [];
        querySnapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setKnowledge(data);
      } catch (err) {
        console.error('Error loading knowledge:', err);
        setError('Failed to load knowledge base');
      } finally {
        setLoading(false);
      }
    };

    loadKnowledge();
  }, []);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.question.trim() ||
      !formData.answer.trim() ||
      !formData.keywords.trim()
    ) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const keywords = formData.keywords
        .split(',')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      const payload = {
        question: formData.question,
        answer: formData.answer,
        keywords,
        category: formData.category || 'General',
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        // Update existing
        await updateDoc(doc(db, 'knowledge_base', editingId), payload);
        setKnowledge((prev) =>
          prev.map((item) =>
            item.id === editingId ? { ...item, ...payload } : item
          )
        );
        setSuccess('Knowledge entry updated successfully');
      } else {
        // Add new
        const docRef = await addDoc(collection(db, 'knowledge_base'), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: currentUser.uid,
        });
        setKnowledge((prev) => [
          ...prev,
          {
            id: docRef.id,
            ...payload,
            createdBy: currentUser.uid,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
        setSuccess('Knowledge entry created successfully');
      }

      // Refresh search cache
      await refreshKnowledgeBase();

      // Reset form
      setFormData({
        question: '',
        answer: '',
        keywords: '',
        category: '',
      });
      setEditingId(null);
      setError(null);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving knowledge:', err);
      setError('Failed to save knowledge entry');
    }
  };

  // Handle edit
  const handleEdit = (item) => {
    setFormData({
      question: item.question,
      answer: item.answer,
      keywords: (item.keywords || []).join(', '),
      category: item.category || '',
    });
    setEditingId(item.id);
    setError(null);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'knowledge_base', id));
      setKnowledge((prev) => prev.filter((item) => item.id !== id));
      setSuccess('Knowledge entry deleted successfully');

      // Refresh search cache
      await refreshKnowledgeBase();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting knowledge:', err);
      setError('Failed to delete knowledge entry');
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setFormData({
      question: '',
      answer: '',
      keywords: '',
      category: '',
    });
    setEditingId(null);
    setError(null);
  };

  // Filter knowledge based on search query
  const filteredKnowledge = knowledge.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.question.toLowerCase().includes(searchLower) ||
      item.answer.toLowerCase().includes(searchLower) ||
      (item.keywords || []).some((k) =>
        k.toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Knowledge Base Management
        </h1>
        <p className="text-gray-600">
          Manage AI support questions and answers
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <svg
            className="w-5 h-5 text-red-600 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            ></path>
          </svg>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
          <svg
            className="w-5 h-5 text-green-600 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            ></path>
          </svg>
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {editingId ? 'Edit Knowledge Entry' : 'Add New Knowledge Entry'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question *
            </label>
            <input
              type="text"
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              placeholder="e.g., How to disable call forwarding?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Answer *
            </label>
            <textarea
              name="answer"
              value={formData.answer}
              onChange={handleInputChange}
              placeholder="e.g., Press OK -> Phone -> Call Features -> Account 1 -> Fwd Disable"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords * (comma-separated)
              </label>
              <input
                type="text"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                placeholder="e.g., fwd disable, call forwarding, redirect"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g., Call Features"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search Section */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search knowledge entries..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Knowledge List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">Loading knowledge base...</p>
          </div>
        ) : filteredKnowledge.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">
              {knowledge.length === 0
                ? 'No knowledge entries yet. Create your first one above!'
                : 'No entries match your search.'}
            </p>
          </div>
        ) : (
          filteredKnowledge.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {item.question}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{item.answer}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {(item.keywords || []).map((keyword, idx) => (
                  <span
                    key={idx}
                    className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex gap-2">
                  {item.category && (
                    <span className="px-2 py-1 bg-gray-100 rounded">
                      {item.category}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>{knowledge.length}</strong> total entries in knowledge base
        </p>
      </div>
    </div>
  );
};

export default AdminKnowledge;
