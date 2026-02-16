import { useState } from 'react';
import { PRIORITY_LEVELS } from '../../utils/constants';
import ImageUpload from '../common/ImageUpload';

const TaskForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [headline, setHeadline] = useState(initialData?.headline || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState(initialData?.priority || 'Medium');
  const [deadline, setDeadline] = useState(
    initialData?.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : ''
  );
  const [assignedTo, setAssignedTo] = useState(initialData?.assignedTo || '');
  const [images, setImages] = useState(initialData?.attachments || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      headline,
      description,
      priority,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      assignedTo,
      attachments: images,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-2">
          Task Headline *
        </label>
        <input
          id="headline"
          type="text"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter task headline"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="Enter task description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
            Priority *
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            {PRIORITY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
            Deadline
          </label>
          <input
            id="deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
          Assign To (Email)
        </label>
        <input
          id="assignedTo"
          type="email"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          placeholder="user@example.com"
        />
      </div>

      <ImageUpload onImageSelect={setImages} existingImages={images} />

      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          {initialData ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
