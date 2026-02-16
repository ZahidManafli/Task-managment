const StockList = ({
  items,
  selectedTypeId,
  viewMode = 'grid',
  onChangeQuantity,
  onSelectItem,
}) => {
  const filteredItems =
    selectedTypeId === 'all'
      ? items
      : items.filter((item) => item.typeId === selectedTypeId);

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No products found for this filter. Add a product to get started.
        </p>
      </div>
    );
  }

  const renderCard = (item) => {
    const propertyEntries = item.properties
      ? Object.entries(item.properties)
      : [];
    const qty = Number(item.quantity) || 0;

    let qtyBadgeClass =
      'px-2 py-1 text-xs rounded-full border bg-blue-50 text-blue-700 border-blue-100';
    let qtyLabel = `Qty: ${qty}`;

    if (qty === 0) {
      qtyBadgeClass =
        'px-2 py-1 text-xs rounded-full border bg-red-50 text-red-700 border-red-200';
      qtyLabel = 'Out of stock';
    } else if (qty > 0 && qty <= 3) {
      qtyBadgeClass =
        'px-2 py-1 text-xs rounded-full border bg-amber-50 text-amber-700 border-amber-200';
    }

    return (
      <div
        key={item.id}
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col space-y-3 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onSelectItem && onSelectItem(item)}
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {item.name}
              </h3>
              {item.typeName && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                  {item.typeName}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className={qtyBadgeClass}>{qtyLabel}</div>
            {onChangeQuantity && (
              <div className="inline-flex items-center space-x-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeQuantity(item.id, -1);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeQuantity(item.id, 1);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>

        {propertyEntries.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Properties
            </p>
            <ul className="space-y-0.5 text-sm text-gray-700">
              {propertyEntries.slice(0, 4).map(([key, value]) => (
                <li key={key}>
                  <span className="font-medium">{key}:</span> {value}
                </li>
              ))}
              {propertyEntries.length > 4 && (
                <li className="text-xs text-gray-400">
                  + {propertyEntries.length - 4} more
                </li>
              )}
            </ul>
          </div>
        )}

        {item.note && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Note
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {item.note}
            </p>
          </div>
        )}

        <div className="text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100 flex justify-between items-center">
          <span>Created by {item.createdBy || 'Unknown'}</span>
          <span className="italic">
            {qty === 0 ? 'Restock needed' : qty <= 3 ? 'Low stock' : 'In stock'}
          </span>
        </div>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Product</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Quantity</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Key Properties</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredItems.map((item) => {
              const propertyEntries = item.properties
                ? Object.entries(item.properties)
                : [];
              const qty = Number(item.quantity) || 0;

              let qtyTextClass = 'text-gray-800';
              if (qty === 0) qtyTextClass = 'text-red-600 font-semibold';
              else if (qty <= 3) qtyTextClass = 'text-amber-600 font-semibold';

              return (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onSelectItem && onSelectItem(item)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {item.typeName || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className={qtyTextClass}>
                        {qty === 0 ? 'Out of stock' : qty}
                      </span>
                      {onChangeQuantity && (
                        <div className="inline-flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onChangeQuantity(item.id, -1);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs"
                          >
                            -
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onChangeQuantity(item.id, 1);
                            }}
                            className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {propertyEntries.length === 0
                      ? '-'
                      : propertyEntries
                          .slice(0, 3)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(' • ')}
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                    {item.note || '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredItems.map((item) => renderCard(item))}
    </div>
  );
};

export default StockList;

