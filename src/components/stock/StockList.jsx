const StockList = ({
  items,
  types = [],
  selectedTypeId,
  selectedAvailability = 'all',
  searchTerm = '',
  viewMode = 'grid',
  onChangeQuantity,
  onSelectItem,
}) => {
  const typeById = types.reduce((acc, t) => {
    acc[t.id] = t;
    return acc;
  }, {});

  let filteredItems =
    selectedTypeId === 'all'
      ? items
      : items.filter((item) => item.typeId === selectedTypeId);
  
  // Apply availability filter
  if (selectedAvailability !== 'all') {
    const isAvailable = selectedAvailability === 'available';
    filteredItems = filteredItems.filter(
      (item) => (item.available !== false) === isAvailable
    );
  }

  // Apply text search filter
  const normalizedSearch = searchTerm.trim().toLowerCase();
  if (normalizedSearch) {
    filteredItems = filteredItems.filter((item) => {
      const name = item.name?.toLowerCase() || '';
      const typeName = item.typeName?.toLowerCase() || '';
      const note = item.note?.toLowerCase() || '';
      const propertiesText = item.properties
        ? Object.entries(item.properties)
            .map(([key, value]) => `${key} ${value}`)
            .join(' ')
            .toLowerCase()
        : '';

      return (
        name.includes(normalizedSearch) ||
        typeName.includes(normalizedSearch) ||
        note.includes(normalizedSearch) ||
        propertiesText.includes(normalizedSearch)
      );
    });
  }

  if (filteredItems.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-gray-300 bg-gradient-to-b from-white via-white to-slate-50">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-sm">
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M3 7l9-4 9 4-9 4-9-4z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M3 12l9 4 9-4"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.8}
              d="M3 17l9 4 9-4"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          No stock items match your filters
        </h3>
        <p className="text-sm text-gray-500 max-w-md">
          Try changing the type, availability, or search text. You can also add a new product from
          the top-right of the Stock page.
        </p>
      </div>
    );
  }

  const getTypeIcon = (typeNameRaw) => {
    const typeName = (typeNameRaw || '').toLowerCase();

    // Power Supply Control
    if (typeName.includes('power supply') || typeName.includes('psu')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M7 7h10v10H7V7z"
          />
          <path strokeLinecap="round" strokeWidth={1.8} d="M4 10h2M18 14h2M10 4v2M14 4v2" />
        </svg>
      );
    }

    // Cartridges - "Katriclər"
    if (typeName.includes('katric')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="5" y="4" width="10" height="16" rx="2" ry="2" strokeWidth={1.8} />
          <path strokeWidth={1.4} d="M9 8h2M9 11h2M9 14h2" />
          <circle cx="16.5" cy="15.5" r="2.5" strokeWidth={1.8} />
        </svg>
      );
    }

    // LED Screens - "Led Ekranlar"
    if (typeName.includes('led ekran') || typeName.includes('ekran')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="12" rx="2" ry="2" strokeWidth={1.8} />
          <path strokeLinecap="round" strokeWidth={1.8} d="M8 19h8" />
        </svg>
      );
    }

    // Generic "Other" - "Digərləri"
    if (typeName.includes('digər')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="4" width="7" height="7" rx="2" strokeWidth={1.8} />
          <rect x="13" y="4" width="7" height="7" rx="2" strokeWidth={1.8} />
          <rect x="4" y="13" width="7" height="7" rx="2" strokeWidth={1.8} />
          <rect x="13" y="13" width="7" height="7" rx="2" strokeWidth={1.8} />
        </svg>
      );
    }

    // Battery / Akumlyator
    if (typeName.includes('akum')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="8" width="14" height="8" rx="2" ry="2" strokeWidth={1.8} />
          <path strokeWidth={1.8} d="M18 10h1a2 2 0 012 2 2 2 0 01-2 2h-1" />
          <path strokeLinecap="round" strokeWidth={1.6} d="M8 12h4" />
        </svg>
      );
    }

    // Adapter cables - "Adapter kabelləri"
    if (typeName.includes('kabel')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M7 8v3a5 5 0 105 5h2"
          />
          <path strokeLinecap="round" strokeWidth={1.8} d="M14 4h4v4M18 4l-5 5" />
        </svg>
      );
    }

    // ZKT BioDevice / ZK Controller
    if (typeName.includes('zkt') || typeName.includes('zk controller')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth={1.8} />
          <circle cx="12" cy="11" r="3" strokeWidth={1.6} />
          <path strokeLinecap="round" strokeWidth={1.4} d="M9 16.5c.6-1 1.8-1.5 3-1.5s2.4.5 3 1.5" />
        </svg>
      );
    }

    // Network devices - "Şəbəkə cihazları"
    if (typeName.includes('şəbək') || typeName.includes('sebek')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M4 15h16v4H4v-4zM7 11a5 5 0 0110 0M9 11a3 3 0 016 0"
          />
        </svg>
      );
    }

    // Printers - "Printerlər"
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

    // Laptop / Computer
    if (typeName.includes('laptop') || typeName.includes('notebook') || typeName.includes('noutbuk')) {
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

    // Desktop / PC
    if (typeName.includes('pc') || typeName.includes('computer') || typeName.includes('kompüter')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="12" rx="2" ry="2" strokeWidth={1.8} />
          <path strokeLinecap="round" strokeWidth={1.8} d="M8 20h8M12 16v4" />
        </svg>
      );
    }

    // Monitor
    if (typeName.includes('monitor') || typeName.includes('screen')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="12" rx="2" ry="2" strokeWidth={1.8} />
          <path strokeLinecap="round" strokeWidth={1.8} d="M8 20h8" />
        </svg>
      );
    }

    // Mouse
    if (typeName.includes('mouse') || typeName.includes('maus')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="8" y="3" width="8" height="18" rx="4" ry="4" strokeWidth={1.8} />
          <path strokeLinecap="round" strokeWidth={1.6} d="M12 7V4.5" />
        </svg>
      );
    }

    // Keyboard
    if (typeName.includes('keyboard') || typeName.includes('klaviatur')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="7" width="18" height="10" rx="2" ry="2" strokeWidth={1.8} />
          <path strokeWidth={1.4} d="M7 10h1M10 10h1M13 10h1M16 10h1M7 13h1M10 13h4M16 13h1" />
        </svg>
      );
    }

    // Network / Router
    if (typeName.includes('router') || typeName.includes('network')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
            d="M4 15h16v4H4v-4zM7 11a5 5 0 0110 0M9 11a3 3 0 016 0"
          />
        </svg>
      );
    }

    // Phone / Mobile
    // Phones - "Telefonlar"
    if (typeName.includes('phone') || typeName.includes('mobile') || typeName.includes('telefon')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="8" y="2" width="8" height="20" rx="2" ry="2" strokeWidth={1.8} />
          <circle cx="12" cy="18" r="0.6" />
        </svg>
      );
    }

    // External storage - "Xarici yaddaş qurğuları"
    if (typeName.includes('xarici yaddaş')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="3" width="12" height="18" rx="2" ry="2" strokeWidth={1.8} />
          <path strokeWidth={1.4} d="M10 7h4M10 10h2" />
        </svg>
      );
    }

    // RAM - "Əməli yaddaş qurğuları"
    if (typeName.includes('əməli yaddaş')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="4" y="7" width="16" height="8" rx="1.5" ry="1.5" strokeWidth={1.8} />
          <path strokeWidth={1.4} d="M8 10h2M11 10h2M14 10h2M6 16v2M9 16v2M12 16v2M15 16v2M18 16v2" />
        </svg>
      );
    }

    // Adapters - "Adapterlər"
    if (typeName.includes('adapter')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="5" y="7" width="10" height="8" rx="2" ry="2" strokeWidth={1.8} />
          <path strokeLinecap="round" strokeWidth={1.8} d="M9 4v3M11 4v3M15 11h3" />
        </svg>
      );
    }

    // Barcode readers - "Barcod oxuyucular"
    if (typeName.includes('barcod')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth={1.6} d="M5 7v10M8 7v10M11 7v10M14 7v10M17 7v10" />
        </svg>
      );
    }

    // Cameras - "Kameralar"
    if (typeName.includes('kamera')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="7" width="18" height="12" rx="3" ry="3" strokeWidth={1.8} />
          <circle cx="12" cy="13" r="3" strokeWidth={1.8} />
          <path strokeWidth={1.6} d="M8 7l1.5-2h5L16 7" />
        </svg>
      );
    }

    // Card readers - "Kart oxuyucular"
    if (typeName.includes('kart oxuy')) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="3" y="7" width="18" height="10" rx="2" ry="2" strokeWidth={1.8} />
          <path strokeWidth={1.4} d="M4 10h16" />
          <path strokeWidth={1.4} d="M7 14h3M12 14h2" />
        </svg>
      );
    }

    // Default: first letter fallback
    const letter = (typeNameRaw || '?').charAt(0).toUpperCase();
    return <span className="text-sm font-semibold text-blue-600">{letter}</span>;
  };

  const renderCard = (item) => {
    const propertyEntries = item.properties
      ? Object.entries(item.properties)
      : [];
    const qty = Number(item.quantity) || 0;
    const itemType = typeById[item.typeId];
    const shelfRow = itemType?.row;
    const shelfCol = itemType?.col;
    const hasShelfLocation = shelfRow != null && shelfCol != null;
    const shelfLocationText = hasShelfLocation
      ? `Sıra ${shelfRow}, Sütun ${shelfCol}`
      : 'Təyin edilməyib';

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

    const isAvailable = item.available !== false;

    return (
      <div
        key={item.id}
        className="group relative overflow-hidden bg-gradient-to-br from-white via-white to-slate-50 border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col space-y-3 cursor-pointer hover:shadow-xl hover:-translate-y-0.5 hover:border-blue-200 transition-all"
        onClick={() => onSelectItem && onSelectItem(item)}
      >
        {/* Decorative background shapes */}
        <div className="pointer-events-none absolute -right-10 -top-10 w-28 h-28 rounded-full bg-blue-50 opacity-40 blur-2xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-16 w-32 h-32 rounded-full bg-emerald-50 opacity-40 blur-2xl" />

        <div
          className={`absolute inset-y-3 left-0 w-1 rounded-full ${
            isAvailable ? 'bg-emerald-400' : 'bg-red-400'
          }`}
        />
        <div className="flex justify-between items-start gap-4 pl-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-1 w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              {getTypeIcon(item.typeName || itemType?.name || item.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {item.name}
                </h3>
                {item.typeName && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {item.typeName}
                  </span>
                )}
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                    isAvailable
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      isAvailable ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  />
                  {isAvailable ? 'Available' : 'Not Available'}
                </div>
              </div>
              <div className="text-[11px] text-gray-600 flex items-center gap-1.5">
                <span className="font-semibold text-gray-700">Rəfdəki yeri:</span>
                <span>{shelfLocationText}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div className={qtyBadgeClass}>{qtyLabel}</div>
            {onChangeQuantity && (
              <div className="inline-flex items-center space-x-1 rounded-full bg-white/70 border border-gray-200 px-1.5 py-0.5 shadow-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeQuantity(item.id, -1);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs"
                >
                  -
                </button>
                <span className="text-[11px] text-gray-500 px-1">edit</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeQuantity(item.id, 1);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>

        {propertyEntries.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-gray-100">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Properties
            </p>
            <ul className="flex flex-wrap gap-1.5 text-[11px] text-gray-700">
              {propertyEntries.slice(0, 4).map(([key, value]) => (
                <li
                  key={key}
                  className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/80 border border-gray-200 shadow-xs max-w-full"
                >
                  <span className="font-semibold mr-1 truncate">{key}:</span>
                  <span className="truncate">{value}</span>
                </li>
              ))}
              {propertyEntries.length > 4 && (
                <li className="text-[11px] text-gray-400">
                  + {propertyEntries.length - 4} more
                </li>
              )}
            </ul>
          </div>
        )}

        {item.note && (
          <div className="pt-1">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
              Note
            </p>
            <p className="text-xs text-gray-700 whitespace-pre-line line-clamp-2 group-hover:line-clamp-4">
              {item.note}
            </p>
          </div>
        )}

        <div className="text-[11px] text-gray-400 mt-auto pt-2 border-t border-gray-100 flex justify-between items-center">
          <span className="truncate">
            Created by <span className="font-medium">{item.createdBy || 'Unknown'}</span>
          </span>
          <span className="italic">
            {qty === 0 ? 'Restock needed' : qty <= 3 ? 'Low stock' : 'In stock'}
          </span>
        </div>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-gradient-to-b from-white via-white to-slate-50 shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                Product
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                Type
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                Key Properties
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                Note
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const propertyEntries = item.properties
                ? Object.entries(item.properties)
                : [];
              const qty = Number(item.quantity) || 0;
              const isAvailable = item.available !== false;
              const itemType = typeById[item.typeId];
              const shelfRow = itemType?.row;
              const shelfCol = itemType?.col;
              const hasShelfLocation = shelfRow != null && shelfCol != null;
              const shelfLocationText = hasShelfLocation
                ? `Sıra ${shelfRow}, Sütun ${shelfCol}`
                : 'Təyin edilməyib';

              let qtyTextClass = 'text-gray-800';
              if (qty === 0) qtyTextClass = 'text-red-600 font-semibold';
              else if (qty <= 3) qtyTextClass = 'text-amber-600 font-semibold';

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  onClick={() => onSelectItem && onSelectItem(item)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                        {getTypeIcon(item.typeName || itemType?.name || item.name)}
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 truncate">
                            {item.name}
                          </span>
                          {item.typeName && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {item.typeName}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-600">
                          <span className="font-semibold">Rəfdəki yeri:</span> {shelfLocationText}
                        </div>
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium w-fit ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              isAvailable ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          {isAvailable ? 'Available' : 'Not Available'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-sm">
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

