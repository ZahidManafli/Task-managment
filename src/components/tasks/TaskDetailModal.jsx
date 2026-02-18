import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PRIORITY_COLORS, STATUS_COLORS, PRIORITY_LEVELS, TASK_STATUSES } from '../../utils/constants';
import CommentSection from './CommentSection';
import ImageUpload from '../common/ImageUpload';

const TaskDetailModal = ({ task, onClose, onUpdate, onDelete }) => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const canDelete = typeof onDelete === 'function';

  const handleUpdate = (updates) => {
    onUpdate({ ...editedTask, ...updates });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!canDelete) return;
    onDelete(task.id);
    onClose();
  };

  const handleStatusChange = (newStatus) => {
    handleUpdate({ status: newStatus });
  };

  const handleAddComment = (commentText) => {
    const newComment = {
      text: commentText,
      userId: currentUser?.email || currentUser?.uid,
      userEmail: currentUser?.email,
      timestamp: new Date(),
    };
    const updatedComments = [...(task.comments || []), newComment];
    // Comment updates should NOT trigger emails (template limit), so we only save the comment.
    handleUpdate({ comments: updatedComments });
  };

  const handleUpdateComment = (index, newText) => {
    const existingComments = task.comments || [];
    if (!existingComments[index]) return;

    const updatedComments = existingComments.map((comment, i) =>
      i === index ? { ...comment, text: newText } : comment
    );

    // Comment updates should NOT trigger emails
    handleUpdate({ comments: updatedComments });
  };

  const handleImageUpdate = (images) => {
    handleUpdate({ attachments: images });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!task) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Task Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!isEditing ? (
            <>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{task.headline}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 text-sm font-medium rounded border ${PRIORITY_COLORS[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded border ${STATUS_COLORS[task.status]}`}>
                    {task.status}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{task.description || 'No description'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Deadline</span>
                  <p className="text-gray-900">{formatDate(task.deadline)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Assigned To</span>
                  <p className="text-gray-900">{task.assignedTo || 'Unassigned'}</p>
                </div>
              </div>

              {task.attachments && task.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Attachments</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {task.attachments.map((img, index) => (
                      <img
                        key={index}
                        src={img.url || img.preview}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                    ))}
                  </div>
                </div>
              )}

              <CommentSection
                comments={task.comments || []}
                onAddComment={handleAddComment}
                onUpdateComment={handleUpdateComment}
              />

              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Edit Task
                </button>
                {canDelete && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Delete Task
                  </button>
                )}
                <div className="flex-1"></div>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`px-4 py-2 rounded-lg border ${STATUS_COLORS[task.status]} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  {TASK_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Headline</label>
                <input
                  type="text"
                  value={editedTask.headline}
                  onChange={(e) => setEditedTask({ ...editedTask, headline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={editedTask.priority}
                    onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value })}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                  <input
                    type="date"
                    value={editedTask.deadline ? new Date(editedTask.deadline).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value ? new Date(e.target.value).toISOString() : null })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                <input
                  type="email"
                  value={editedTask.assignedTo || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, assignedTo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="user@example.com"
                />
              </div>
              <div className="mb-4">
                <ImageUpload onImageSelect={handleImageUpdate} existingImages={task.attachments || []} />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdate(editedTask)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {canDelete && showDeleteConfirm && (
            <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-[60]">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Task</h3>
                <p className="text-gray-600 mb-4">Are you sure you want to delete this task? This action cannot be undone.</p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
