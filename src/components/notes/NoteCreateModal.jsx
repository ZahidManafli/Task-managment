import NoteForm from './NoteForm';

const NoteCreateModal = ({ onClose, onSubmit, initialData = null }) => {
  const handleSubmit = (noteData) => {
    onSubmit(noteData);
    onClose();
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {initialData ? 'Edit Note' : 'Create New Note'}
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

        <div className="p-6">
          <NoteForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            initialData={initialData}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteCreateModal;
