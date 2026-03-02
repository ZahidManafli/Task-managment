const ComputerList = ({ computers, onSelect, onAssign, onReturn }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      available: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Available',
      },
      in_use: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        label: 'In Use',
      },
      maintenance: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        label: 'Maintenance',
      },
    };

    const config = statusConfig[status] || statusConfig.available;

    return (
      <div
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} border ${config.border}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`} />
        {config.label}
      </div>
    );
  };

  if (!computers || computers.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <svg
          className="w-16 h-16 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="4" width="18" height="12" rx="2" ry="2" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeWidth={1.5} d="M8 20h8M12 16v4" />
        </svg>
        <p className="text-gray-600 font-medium">No computers found</p>
        <p className="text-gray-500 text-sm mt-1">Add your first computer to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {computers.map((computer) => (
        <div
          key={computer.id}
          className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer"
          onClick={() => onSelect(computer)}
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="4" width="18" height="12" rx="2" ry="2" strokeWidth={1.8} />
                    <path strokeLinecap="round" strokeWidth={1.8} d="M8 20h8M12 16v4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                    {computer.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {computer.brand} {computer.model}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="mb-3">
              {getStatusBadge(computer.status)}
            </div>

            {/* Assigned User */}
            {computer.assignedTo && (
              <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-0.5">Assigned to:</p>
                <p className="text-sm font-medium text-gray-900">{computer.assignedTo}</p>
                {computer.assignmentDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Since: {new Date(computer.assignmentDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Specifications */}
            {(computer.specifications?.processor || computer.specifications?.ram) && (
              <div className="space-y-1 mb-3">
                {computer.specifications.processor && (
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">CPU:</span> {computer.specifications.processor}
                  </p>
                )}
                {computer.specifications.ram && (
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">RAM:</span> {computer.specifications.ram}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              {computer.status === 'available' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAssign(computer);
                  }}
                  className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition"
                >
                  Assign
                </button>
              )}
              {computer.status === 'in_use' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReturn(computer);
                  }}
                  className="flex-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition"
                >
                  Return
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(computer);
                }}
                className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Details
              </button>
            </div>
          </div>

          {/* Image Preview */}
          {computer.images && computer.images.length > 0 && (
            <div className="border-t border-gray-100">
              <img
                src={computer.images[0].url || computer.images[0].preview}
                alt={computer.name}
                className="w-full h-32 object-cover rounded-b-lg"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ComputerList;
