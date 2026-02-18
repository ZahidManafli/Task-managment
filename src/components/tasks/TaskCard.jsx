import { PRIORITY_COLORS, STATUS_COLORS } from '../../utils/constants';
import TaskMenu from './TaskMenu';

const getStatusDotClass = (status) => {
  switch (status) {
    case 'To Do':
      return 'bg-gray-400';
    case 'In Progress':
      return 'bg-blue-500';
    case 'Review':
      return 'bg-purple-500';
    case 'Done':
      return 'bg-green-500';
    default:
      return 'bg-gray-300';
  }
};

const getTaskIcon = (status, priority) => {
  const s = status || '';
  const p = priority || '';

  if (s === 'In Progress') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M12 6v6l4 2"
        />
        <circle cx="12" cy="12" r="8" strokeWidth={1.8} />
      </svg>
    );
  }

  if (s === 'Review') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M5 5h14v12H9l-4 4V5z"
        />
      </svg>
    );
  }

  if (s === 'Done') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M5 13l4 4L19 7"
        />
      </svg>
    );
  }

  if (p === 'High') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M12 4l3 7H9l3-7zm0 9v7"
        />
      </svg>
    );
  }

  if (p === 'Low') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeWidth={1.8} d="M4 18h16M4 14h8" />
      </svg>
    );
  }

  // Default: checklist icon
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M5 7h14M5 12h9M5 17h6"
      />
    </svg>
  );
};

const TaskCard = ({ task, onSetStatus, onSeeDetails, onSetUser, onAddCommentary, viewMode = 'grid' }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date() && task.status !== 'Done';
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white/90 rounded-xl border border-slate-200 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-semibold shadow-xs">
              {getTaskIcon(task.status, task.priority)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-sm font-semibold text-slate-900 truncate">
                  {task.headline}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border ${PRIORITY_COLORS[task.priority]}`}
                >
                  {task.priority}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border ${STATUS_COLORS[task.status]}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDotClass(task.status)}`}
                  />
                  {task.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-1 line-clamp-2">
                {task.description || 'No description'}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 mt-1">
                <span className={isOverdue(task.deadline) ? 'text-red-600 font-semibold' : ''}>
                  📅 {formatDate(task.deadline)}
                </span>
                {task.assignedTo && (
                  <span>👤 {task.assignedTo}</span>
                )}
                {task.attachments?.length > 0 && (
                  <span>📎 {task.attachments.length} file(s)</span>
                )}
                {task.comments?.length > 0 && (
                  <span>💬 {task.comments.length} comment(s)</span>
                )}
              </div>
            </div>
          </div>
          <TaskMenu
            onSetStatus={() => onSetStatus(task)}
            onSeeDetails={() => onSeeDetails(task)}
            onSetUser={() => onSetUser(task)}
            onAddCommentary={() => onAddCommentary(task)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white/90 rounded-2xl border border-slate-200 p-4 hover:shadow-xl hover:-translate-y-0.5 hover:border-blue-200 transition-all cursor-pointer">
      <div className="flex items-start justify-between mb-2 gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-semibold shadow-xs">
            {getTaskIcon(task.status, task.priority)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 truncate mb-1">
              {task.headline}
            </h3>
            <p className="text-xs text-slate-600 mb-2 line-clamp-3">
              {task.description || 'No description'}
            </p>
            <div className="flex flex-wrap gap-2 mb-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border ${PRIORITY_COLORS[task.priority]}`}
              >
                {task.priority}
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full border ${STATUS_COLORS[task.status]}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${getStatusDotClass(task.status)}`}
                />
                {task.status}
              </span>
              {task.assignedTo && (
                <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-50 text-slate-700 border border-slate-200">
                  👤 {task.assignedTo}
                </span>
              )}
            </div>
          </div>
        </div>
        <TaskMenu
          onSetStatus={() => onSetStatus(task)}
          onSeeDetails={() => onSeeDetails(task)}
          onSetUser={() => onSetUser(task)}
          onAddCommentary={() => onAddCommentary(task)}
        />
      </div>
      <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
        <div className={isOverdue(task.deadline) ? 'text-red-600 font-semibold' : ''}>
          📅 {formatDate(task.deadline)}
        </div>
        <div className="flex items-center gap-3">
          {task.attachments?.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <span>📎</span>
              <span>{task.attachments.length}</span>
            </span>
          )}
          {task.comments?.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <span>💬</span>
              <span>{task.comments.length}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
