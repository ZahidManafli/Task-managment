import { useState, useEffect } from 'react';
import ImageUpload from '../common/ImageUpload';

const ComputerDetailModal = ({ computer, onClose, onUpdate, onDelete, isAdmin }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [specifications, setSpecifications] = useState({
    processor: '',
    ram: '',
    storage: '',
    os: '',
  });
  const [note, setNote] = useState('');
  const [images, setImages] = useState([]);
  const [status, setStatus] = useState('available');

  useEffect(() => {
    if (!computer) return;
    setName(computer.name || '');
    setBrand(computer.brand || '');
    setModel(computer.model || '');
    setSerialNumber(computer.serialNumber || '');
    setSpecifications(computer.specifications || { processor: '', ram: '', storage: '', os: '' });
    setNote(computer.note || '');
    setImages(computer.images || []);
    setStatus(computer.status || 'available');
    setIsEditing(false);
  }, [computer]);

  const handleCancelEdit = () => {
    if (!computer) return;
    setName(computer.name || '');
    setBrand(computer.brand || '');
    setModel(computer.model || '');
    setSerialNumber(computer.serialNumber || '');
    setSpecifications(computer.specifications || { processor: '', ram: '', storage: '', os: '' });
    setNote(computer.note || '');
    setImages(computer.images || []);
    setStatus(computer.status || 'available');
    setIsEditing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !model.trim()) return;

    onUpdate({
      id: computer.id,
      name: name.trim(),
      brand: brand.trim(),
      model: model.trim(),
      serialNumber: serialNumber.trim(),
      specifications,
      note: note.trim(),
      images: images,
      status: status,
    });
  };

  const getStatusBadge = (statusValue) => {
    const statusConfig = {
      available: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Available' },
      in_use: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'In Use' },
      maintenance: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Maintenance' },
    };
    const config = statusConfig[statusValue] || statusConfig.available;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text} border ${config.border}`}>
        {config.label}
      </span>
    );
  };

  if (!computer) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-slate-900/15 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-100">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="12" rx="2" ry="2" strokeWidth={1.8} />
                <path strokeLinecap="round" strokeWidth={1.8} d="M8 20h8M12 16v4" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{computer.name}</h2>
              <p className="text-xs text-slate-500">{computer.brand} {computer.model}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pt-4 pb-6 space-y-6">
          {!isEditing ? (
            <div className="space-y-6">
              {/* Status and Assignment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Status</p>
                  {getStatusBadge(computer.status)}
                </div>
                {computer.assignedTo && (
                  <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Assigned To</p>
                    <p className="text-sm font-medium text-slate-900">{computer.assignedTo}</p>
                    {computer.assignmentDate && (
                      <p className="text-xs text-slate-600 mt-1">
                        Since: {new Date(computer.assignmentDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Serial Number</p>
                  <p className="text-sm text-slate-900 mt-1">{computer.serialNumber || '-'}</p>
                </div>
              </div>

              {/* Specifications */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Specifications</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {computer.specifications?.processor && (
                    <div>
                      <span className="text-slate-500">Processor:</span>
                      <span className="ml-2 text-slate-900">{computer.specifications.processor}</span>
                    </div>
                  )}
                  {computer.specifications?.ram && (
                    <div>
                      <span className="text-slate-500">RAM:</span>
                      <span className="ml-2 text-slate-900">{computer.specifications.ram}</span>
                    </div>
                  )}
                  {computer.specifications?.storage && (
                    <div>
                      <span className="text-slate-500">Storage:</span>
                      <span className="ml-2 text-slate-900">{computer.specifications.storage}</span>
                    </div>
                  )}
                  {computer.specifications?.os && (
                    <div>
                      <span className="text-slate-500">OS:</span>
                      <span className="ml-2 text-slate-900">{computer.specifications.os}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignment Notes */}
              {(computer.assignmentNote || computer.returnNote) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {computer.assignmentNote && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                        Status When Given
                      </p>
                      <p className="text-sm text-slate-700 whitespace-pre-line">{computer.assignmentNote}</p>
                    </div>
                  )}
                  {computer.returnNote && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                        Status When Returned
                      </p>
                      <p className="text-sm text-slate-700 whitespace-pre-line">{computer.returnNote}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Note */}
              {computer.note && (
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Note</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{computer.note}</p>
                </div>
              )}

              {/* Images */}
              {computer.images && computer.images.length > 0 && (
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Images</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {computer.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.url || img.preview}
                          alt={img.name || `Image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-slate-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                {isAdmin && onDelete && (
                  <button
                    onClick={() => onDelete(computer.id)}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium"
                  >
                    Delete
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Computer Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="available">Available</option>
                  <option value="in_use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Specifications</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={specifications.processor}
                    onChange={(e) => setSpecifications({ ...specifications, processor: e.target.value })}
                    placeholder="Processor"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    value={specifications.ram}
                    onChange={(e) => setSpecifications({ ...specifications, ram: e.target.value })}
                    placeholder="RAM"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    value={specifications.storage}
                    onChange={(e) => setSpecifications({ ...specifications, storage: e.target.value })}
                    placeholder="Storage"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    type="text"
                    value={specifications.os}
                    onChange={(e) => setSpecifications({ ...specifications, os: e.target.value })}
                    placeholder="Operating System"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <ImageUpload
                onImageSelect={setImages}
                existingImages={images}
              />

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                {isAdmin && onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(computer.id)}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                  >
                    Delete
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComputerDetailModal;
