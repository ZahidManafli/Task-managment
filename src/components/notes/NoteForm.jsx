import { useState, useEffect } from 'react';

const NoteForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [headline, setHeadline] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setHeadline(initialData.headline || '');
      setDescription(initialData.description || '');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (headline.trim()) {
      onSubmit({
        headline: headline.trim(),
        description: description.trim(),
      });
      setHeadline('');
      setDescription('');
    }
  };

  const handleCancel = () => {
    setHeadline('');
    setDescription('');
    if (onCancel) onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="note-headline" className="block text-sm font-medium text-gray-700 mb-2">
            Headline *
          </label>
          <input
            id="note-headline"
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Enter note headline"
          />
        </div>
        <div>
          <label htmlFor="note-description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="note-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Enter note description"
          />
        </div>
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {initialData ? 'Update Note' : 'Create Note'}
          </button>
        </div>
    </form>
  );
};

export default NoteForm;
