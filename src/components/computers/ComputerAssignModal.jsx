import { useState } from 'react';

const ComputerAssignModal = ({ computer, users, onSubmit, onClose, type = 'assign' }) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'assign' && !selectedUser) return;
    if (!statusNote.trim()) return;

    onSubmit({
      computerId: computer.id,
      userId: selectedUser,
      statusNote: statusNote.trim(),
      type,
    });

    setSelectedUser('');
    setStatusNote('');
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-slate-900/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {type === 'assign' ? 'Assign Computer' : 'Return Computer'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Computer Info */}
          <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Computer</p>
            <p className="text-sm font-medium text-gray-900">{computer.name}</p>
            <p className="text-xs text-gray-600">{computer.brand} {computer.model}</p>
          </div>

          {/* User Selection (for assignment only) */}
          {type === 'assign' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to User *
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">Select user...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.email}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Current user (for return only) */}
          {type === 'return' && computer.assignedTo && (
            <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Currently Assigned To</p>
              <p className="text-sm font-medium text-gray-900">{computer.assignedTo}</p>
            </div>
          )}

          {/* Status Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === 'assign' ? 'Computer Status When Given *' : 'Computer Status When Returned *'}
            </label>
            <textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder={
                type === 'assign'
                  ? 'Describe the condition of the computer when giving it to the user...'
                  : 'Describe the condition of the computer upon return...'
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Note any visible damage, missing parts, or issues
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-white rounded-lg transition ${
                type === 'assign'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {type === 'assign' ? 'Assign Computer' : 'Confirm Return'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComputerAssignModal;
