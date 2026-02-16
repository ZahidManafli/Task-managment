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

  const getExtension = (name = '') => {
    const parts = name.split('.');
    if (parts.length < 2) return '';
    return parts.pop();
  };

  const extension = getExtension(document.name);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-2xl">
          {getFileIcon(document.type)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{document.name}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {formatFileSize(document.size)} • {formatDate(document.uploadedAt)}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-2">
        {onDownload && (
          <button
            onClick={() => onDownload(document)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Open
          </button>
        )}
        <button
          onClick={() => onDelete(document.id)}
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-700 hover:bg-red-50 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
