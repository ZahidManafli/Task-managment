import { useEffect, useState } from 'react';

const emptyProperty = { key: '', value: '' };

// Simple icon mapping based on type name (kept in sync with StockList visuals)
const getTypeIcon = (typeNameRaw) => {
  const typeName = (typeNameRaw || '').toLowerCase();

  if (typeName.includes('printer')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M7 8V4h10v4M7 16h10v4H7v-4zM6 12h12a2 2 0 012 2v2H4v-2a2 2 0 012-2z"
        />
      </svg>
    );
  }

  if (typeName.includes('kompüter') || typeName.includes('computer') || typeName.includes('pc')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="4" width="18" height="12" rx="2" ry="2" strokeWidth={1.8} />
        <path strokeLinecap="round" strokeWidth={1.8} d="M8 20h8M12 16v4" />
      </svg>
    );
  }

  if (typeName.includes('laptop') || typeName.includes('noutbuk') || typeName.includes('notebook')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M4 6h16v8H4V6zM3 18h18"
        />
      </svg>
    );
  }

  if (typeName.includes('led ekran') || typeName.includes('monitor') || typeName.includes('ekran')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="12" rx="2" ry="2" strokeWidth={1.8} />
        <path strokeLinecap="round" strokeWidth={1.8} d="M8 19h8" />
      </svg>
    );
  }

  if (typeName.includes('maus') || typeName.includes('mouse')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="8" y="3" width="8" height="18" rx="4" ry="4" strokeWidth={1.8} />
        <path strokeLinecap="round" strokeWidth={1.6} d="M12 7V4.5" />
      </svg>
    );
  }

  if (typeName.includes('klaviatur') || typeName.includes('keyboard')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="7" width="18" height="10" rx="2" ry="2" strokeWidth={1.8} />
        <path strokeWidth={1.4} d="M7 10h1M10 10h1M13 10h1M16 10h1M7 13h1M10 13h4M16 13h1" />
      </svg>
    );
  }

  if (typeName.includes('telefon') || typeName.includes('phone')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="8" y="2" width="8" height="20" rx="2" ry="2" strokeWidth={1.8} />
        <circle cx="12" cy="18" r="0.6" />
      </svg>
    );
  }

  // Fallback: first letter
  const letter = (typeNameRaw || '?').charAt(0).toUpperCase();
  return <span className="text-sm font-semibold text-blue-600">{letter}</span>;
};

const StockDetailModal = ({ item, types, onClose, onUpdate, onDelete }) => {
  const [name, setName] = useState('');
  const [typeId, setTypeId] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [properties, setProperties] = useState([emptyProperty]);
  const [note, setNote] = useState('');
  const [available, setAvailable] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!item) return;

    setName(item.name || '');
    setTypeId(item.typeId || '');
    setQuantity(Number(item.quantity) || 0);
    setNote(item.note || '');
    setAvailable(item.available !== undefined ? item.available : true);

    const entries = item.properties
      ? Object.entries(item.properties).map(([key, value]) => ({ key, value }))
      : [];
    setProperties(entries.length > 0 ? entries : [emptyProperty]);
    setIsEditing(false);
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

  const handleCancelEdit = () => {
    if (!item) return;
    setName(item.name || '');
    setTypeId(item.typeId || '');
    setQuantity(Number(item.quantity) || 0);
    setNote(item.note || '');
    setAvailable(item.available !== undefined ? item.available : true);
    const entries = item.properties
      ? Object.entries(item.properties).map(([key, value]) => ({ key, value }))
      : [];
    setProperties(entries.length > 0 ? entries : [emptyProperty]);
    setIsEditing(false);
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
      available: available,
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

  const currentType = types?.find((t) => t.id === (item.typeId || typeId)) || null;
  const shelfRow = currentType?.row;
  const shelfCol = currentType?.col;
  const hasShelfLocation = shelfRow != null && shelfCol != null;
  const shelfLocationText = hasShelfLocation
    ? `Sıra ${shelfRow}, Sütun ${shelfCol}`
    : 'Təyin edilməyib';

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-slate-900/15 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-100">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg font-semibold shadow-sm">
              {getTypeIcon(currentType?.name || item.typeName || item.name)}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold text-slate-900 truncate">
                {item.name || 'Product Details'}
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                ID: <span className="font-mono">{item.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition rounded-full p-1 hover:bg-slate-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pt-4 pb-6 space-y-6">
          {/* Meta info row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Created By
              </p>
              <p className="mt-1 text-slate-900 truncate">{item.createdBy || '-'}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Created At
              </p>
              <p className="mt-1 text-slate-900">
                {formatDateTime(item.createdAt)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                Type
              </p>
              <p className="mt-1 text-slate-900">{item.typeName || '-'}</p>
            </div>
          </div>

          {/* View / edit content */}
          {!isEditing ? (
            <div className="space-y-6">
              {/* Overview row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-xs">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Product name
                  </p>
                  <p className="mt-1 text-slate-900 text-sm">{item.name}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-xs">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Quantity
                  </p>
                  <p className="mt-1 text-slate-900 text-sm">{item.quantity ?? 0}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-xs">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Availability
                  </p>
                  <div
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      item.available !== false
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        item.available !== false ? 'bg-emerald-500' : 'bg-red-500'
                      }`}
                    />
                    {item.available !== false ? 'Available' : 'Not Available'}
                  </div>
                  <p className="mt-2 text-[11px] text-slate-600">
                    <span className="font-semibold">Rəfdəki yeri:</span> {shelfLocationText}
                  </p>
                </div>
              </div>

              {/* Properties & note */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Properties
                  </p>
                  {properties.length > 0 && properties[0].key ? (
                    <ul className="flex flex-wrap gap-1.5 text-[11px] text-slate-700">
                      {properties.map((prop, index) => (
                        <li
                          key={`${prop.key}-${index}`}
                          className="inline-flex items-center px-2 py-0.5 rounded-full bg-white border border-slate-200 shadow-xs max-w-full"
                        >
                          <span className="font-semibold mr-1 truncate">{prop.key}:</span>
                          <span className="truncate">{prop.value}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400">No properties defined.</p>
                  )}
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                    Note
                  </p>
                  {note ? (
                    <p className="text-xs text-slate-700 whitespace-pre-line max-h-32 overflow-y-auto">
                      {note}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400">No note added.</p>
                  )}
                </div>
              </div>

              {/* Footer actions */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-3 border-t border-slate-200 mt-2">
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-xs font-medium border border-red-100"
                  >
                    <svg
                      className="w-4 h-4 mr-1.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Delete Product
                  </button>
                )}
                <div className="flex justify-end gap-2 md:ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition text-sm"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability *
                  </label>
                  <select
                    value={available ? 'available' : 'not_available'}
                    onChange={(e) => setAvailable(e.target.value === 'available')}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="not_available">Not Available</option>
                  </select>
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
                        className="col-span-6 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus-border-transparent outline-none text-sm"
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
                    onClick={handleCancelEdit}
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
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDetailModal;

