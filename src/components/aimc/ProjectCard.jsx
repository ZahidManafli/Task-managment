import { useState } from 'react';
import CostFormModal from './CostFormModal';

const PROFIT_TARGET_PERCENT = 70;

const formatAzn = (value) =>
  `${(Number(value) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} AZN`;

const formatPercent = (value) => `${(Number(value) || 0).toFixed(1)}%`;

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

const ProjectCard = ({ project, onDelete, onAddCost, onDeleteCost }) => {
  const [showCostForm, setShowCostForm] = useState(false);

  const revenue = Number(project.revenue) || 0;
  const costs = project.costs || [];
  const totalCosts = costs.reduce((sum, c) => sum + (Number(c.value) || 0), 0);
  const profit = revenue - totalCosts;
  const profitPercent = revenue > 0 ? (profit / revenue) * 100 : 0;
  const costPercent = revenue > 0 ? (totalCosts / revenue) * 100 : 0;
  const meetsTarget = profitPercent >= PROFIT_TARGET_PERCENT;

  return (
    <div className="bg-white/90 rounded-2xl border border-slate-200 p-4 hover:shadow-xl transition-all">
      <div className="flex items-start justify-between mb-2 gap-3">
        <h3 className="text-lg font-semibold text-slate-900">{project.title}</h3>
        <button
          onClick={onDelete}
          className="p-1 text-red-600 hover:bg-red-50 rounded transition flex-shrink-0"
          title="Delete project"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {project.description && (
        <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">{project.description}</p>
      )}

      {project.visitingTime && (
        <p className="text-xs text-gray-500 mb-3">
          Visiting time: {formatDate(project.visitingTime)}
        </p>
      )}

      <div className="space-y-2 mb-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Revenue</span>
          <span className="font-semibold text-slate-900">{formatAzn(revenue)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Total Costs</span>
          <span className="font-medium text-red-600">
            {formatAzn(totalCosts)}{' '}
            <span className="text-xs text-gray-400">({formatPercent(costPercent)})</span>
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Profit</span>
          <span className={`font-semibold ${meetsTarget ? 'text-green-600' : 'text-red-600'}`}>
            {formatAzn(profit)} <span className="text-xs">({formatPercent(profitPercent)})</span>
          </span>
        </div>
      </div>

      <div
        className={`mb-3 inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border ${
          meetsTarget
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}
      >
        {meetsTarget
          ? `Meets ${PROFIT_TARGET_PERCENT}% profit target`
          : `Below ${PROFIT_TARGET_PERCENT}% profit target`}
      </div>

      <div className="border-t border-gray-100 pt-3">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-semibold text-gray-700">Costs ({costs.length})</h4>
          <button
            onClick={() => setShowCostForm(true)}
            className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
          >
            + Add Cost
          </button>
        </div>

        {costs.length === 0 ? (
          <p className="text-xs text-gray-400">No costs added yet.</p>
        ) : (
          <ul className="space-y-1 max-h-40 overflow-y-auto">
            {costs.map((cost) => (
              <li
                key={cost.id}
                className="flex justify-between items-center text-xs bg-gray-50 rounded px-2 py-1"
              >
                <div className="truncate mr-2">
                  <span className="font-medium text-gray-800">{cost.title}</span>
                  {cost.description && (
                    <span className="text-gray-500"> — {cost.description}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-gray-700">{formatAzn(cost.value)}</span>
                  <button
                    onClick={() => onDeleteCost(cost.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove cost"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showCostForm && (
        <CostFormModal
          onClose={() => setShowCostForm(false)}
          onSubmit={(costData) => {
            onAddCost(costData);
            setShowCostForm(false);
          }}
        />
      )}
    </div>
  );
};

export default ProjectCard;
