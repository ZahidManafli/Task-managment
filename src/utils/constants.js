export const PRIORITY_LEVELS = ['Low', 'Medium', 'High'];

export const TASK_STATUSES = ['To Do', 'In Progress', 'Review', 'Done'];

export const PRIORITY_COLORS = {
  Low: 'bg-blue-100 text-blue-800 border-blue-300',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  High: 'bg-red-100 text-red-800 border-red-300',
};

export const STATUS_COLORS = {
  'To Do': 'bg-gray-100 text-gray-800 border-gray-300',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-300',
  'Review': 'bg-purple-100 text-purple-800 border-purple-300',
  'Done': 'bg-green-100 text-green-800 border-green-300',
};

export const STOCK_STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'not_available', label: 'Not Available' },
  { value: 'must_send_service', label: 'Must Send To Service' },
  { value: 'must_refill', label: 'Must Refill' },
];

export const isKatricTypeName = (typeName = '') =>
  typeName.toLowerCase().includes('katric');

export const getStockStatusValue = (item = {}, typeName = '') => {
  const rawStatus = item.stockStatus || item.status;

  if (rawStatus === 'available' || rawStatus === 'not_available' || rawStatus === 'must_send_service') {
    return rawStatus;
  }

  if (rawStatus === 'must_refill' && isKatricTypeName(typeName || item.typeName || '')) {
    return rawStatus;
  }

  return item.available === false ? 'not_available' : 'available';
};

export const getStockStatusMeta = (status) => {
  const config = {
    available: {
      label: 'Available',
      containerClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      dotClass: 'bg-emerald-500',
    },
    not_available: {
      label: 'Not Available',
      containerClass: 'bg-red-50 text-red-700 border border-red-200',
      dotClass: 'bg-red-500',
    },
    must_send_service: {
      label: 'Must Send To Service',
      containerClass: 'bg-orange-50 text-orange-700 border border-orange-200',
      dotClass: 'bg-orange-500',
    },
    must_refill: {
      label: 'Must Refill',
      containerClass: 'bg-amber-50 text-amber-700 border border-amber-200',
      dotClass: 'bg-amber-500',
    },
  };

  return config[status] || config.not_available;
};
