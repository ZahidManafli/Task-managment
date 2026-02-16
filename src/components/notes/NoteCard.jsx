const NoteCard = ({ note, onEdit, onDelete }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">{note.headline}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(note)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
            title="Edit note"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
            title="Delete note"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      <p className="text-gray-700 whitespace-pre-wrap mb-3">{note.description}</p>
      <div className="text-xs text-gray-500">
        Created: {formatDate(note.createdAt)}
        {note.updatedAt && note.updatedAt !== note.createdAt && (
          <span className="ml-4">Updated: {formatDate(note.updatedAt)}</span>
        )}
      </div>
    </div>
  );
};

export default NoteCard;
