const StockList = ({ items, selectedTypeId }) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredItems.map((item) => {
        const propertyEntries = item.properties
          ? Object.entries(item.properties)
          : [];

        return (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.name}
                </h3>
                {item.typeName && (
                  <p className="text-sm text-gray-500">{item.typeName}</p>
                )}
              </div>
              <div className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                Qty: {item.quantity ?? 0}
              </div>
            </div>

            {propertyEntries.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Properties
                </p>
                <ul className="space-y-0.5 text-sm text-gray-700">
                  {propertyEntries.slice(0, 5).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-medium">{key}:</span> {value}
                    </li>
                  ))}
                  {propertyEntries.length > 5 && (
                    <li className="text-xs text-gray-400">
                      + {propertyEntries.length - 5} more
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

            <div className="text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
              Created by {item.createdBy || 'Unknown'}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StockList;

