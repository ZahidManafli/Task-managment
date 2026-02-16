import { useEffect, useState } from 'react';

const emptyProperty = { key: '', value: '' };

const StockDetailModal = ({ item, types, onClose, onUpdate, onDelete }) => {
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [properties, setProperties] = useState([emptyProperty]);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!item) return;

    setName(item.name || '');
    setTypeId(item.typeId || '');
    setQuantity(Number(item.quantity) || 0);
    setNote(item.note || '');

    const entries = item.properties
      ? Object.entries(item.properties).map(([key, value]) => ({ key, value }))
      : [];
    setProperties(entries.length > 0 ? entries : [emptyProperty]);
  }, [item]);

  const handlePropertyChange = (index, field, value) => {
    setProperties((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddPropertyRow = () => {
    setProperties((prev) => [...prev, emptyProperty]);
  };

  const handleRemovePropertyRow = (index) => {
    setProperties((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !typeId) return;

    const propertiesMap = {};
    properties.forEach((prop) => {
      const key = prop.key.trim();
      const value = prop.value.trim();
      if (key && value) {
        propertiesMap[key] = value;
      }
    });

    onUpdate({
      id: item.id,
      name: name.trim(),
      typeId,
      quantity: Number(quantity) || 0,
      properties: propertiesMap,
      note: note.trim(),
    });
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    const date =
      value.toDate?.() instanceof Date
        ? value.toDate()
        : value.toDate
        ? value.toDate()
        : new Date(value);
    if (!date || Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!item) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
            <p className="text-xs text-gray-500 mt-1">
              ID: <span className="font-mono">{item.id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pt-4 pb-6 space-y-6">
          {/* Meta info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Created By
              </p>
              <p className="mt-1 text-gray-900">{item.createdBy || '-'}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Created At
              </p>
              <p className="mt-1 text-gray-900">
                {formatDateTime(item.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Type
              </p>
              <p className="mt-1 text-gray-900">{item.typeName || '-'}</p>
            </div>
          </div>

          {/* Editable form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  value={typeId}
                  onChange={(e) => setTypeId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select type</option>
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  min={0}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Properties
                </label>
                <button
                  type="button"
                  onClick={handleAddPropertyRow}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add property
                </button>
              </div>

              <div className="space-y-2">
                {properties.map((prop, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      value={prop.key}
                      onChange={(e) => handlePropertyChange(index, 'key', e.target.value)}
                      placeholder="Property (e.g. OS, RAM, Storage)"
                      className="col-span-5 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                    <input
                      type="text"
                      value={prop.value}
                      onChange={(e) => handlePropertyChange(index, 'value', e.target.value)}
                      placeholder="Value (e.g. Windows 11, 16GB, 512GB SSD)"
                      className="col-span-6 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePropertyRow(index)}
                      className="col-span-1 text-gray-400 hover:text-red-500 flex justify-center"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-4">
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm"
                >
                  Delete Product
                </button>
              )}
              <div className="flex justify-end space-x-4 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockDetailModal;

