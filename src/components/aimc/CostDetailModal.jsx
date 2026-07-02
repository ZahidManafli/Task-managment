const formatAzn = (value) =>
  `${(Number(value) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} AZN`;

const formatDate = (value) => {
  if (!value) return '';
  const date = value.toDate ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const CostDetailModal = ({ cost, onClose, onEdit }) => {
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Cost Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Title</p>
            <p className="text-sm font-semibold text-gray-900">{cost.title}</p>
          </div>

          {cost.description && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Description</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{cost.description}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">Value</p>
            <p className="text-sm font-semibold text-gray-900">{formatAzn(cost.value)}</p>
          </div>

          {cost.createdAt && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Added</p>
              <p className="text-sm text-gray-500">{formatDate(cost.createdAt)}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostDetailModal;
