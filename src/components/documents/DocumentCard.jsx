const DocumentCard = ({ document, onDownload, onDelete }) => {
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('image')) return '🖼️';
    if (type?.includes('word') || type?.includes('document')) return '📝';
    if (type?.includes('excel') || type?.includes('spreadsheet')) return '📊';
    if (type?.includes('zip') || type?.includes('archive')) return '📦';
    return '📎';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start space-x-3 flex-1">
          <span className="text-3xl">{getFileIcon(document.type)}</span>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{document.name}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {formatFileSize(document.size)} • {formatDate(document.uploadedAt)}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {onDownload && (
            <button
              onClick={() => onDownload(document)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
              title="Download"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          )}
          <button
            onClick={() => onDelete(document.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
