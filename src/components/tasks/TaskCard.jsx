import { PRIORITY_COLORS, STATUS_COLORS } from '../../utils/constants';
import TaskMenu from './TaskMenu';

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
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{task.headline}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded border ${PRIORITY_COLORS[task.priority]}`}>
                {task.priority}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded border ${STATUS_COLORS[task.status]}`}>
                {task.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className={isOverdue(task.deadline) ? 'text-red-600 font-medium' : ''}>
                📅 {formatDate(task.deadline)}
              </span>
              {task.assignedTo && (
                <span>👤 {task.assignedTo}</span>
              )}
              {task.attachments?.length > 0 && (
                <span>📎 {task.attachments.length} attachment(s)</span>
              )}
              {task.comments?.length > 0 && (
                <span>💬 {task.comments.length} comment(s)</span>
              )}
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
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">{task.headline}</h3>
        <TaskMenu
          onSetStatus={() => onSetStatus(task)}
          onSeeDetails={() => onSeeDetails(task)}
          onSetUser={() => onSetUser(task)}
          onAddCommentary={() => onAddCommentary(task)}
        />
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-3">{task.description}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`px-2 py-1 text-xs font-medium rounded border ${PRIORITY_COLORS[task.priority]}`}>
          {task.priority}
        </span>
        <span className={`px-2 py-1 text-xs font-medium rounded border ${STATUS_COLORS[task.status]}`}>
          {task.status}
        </span>
      </div>
      <div className="space-y-1 text-xs text-gray-500">
        <div className={isOverdue(task.deadline) ? 'text-red-600 font-medium' : ''}>
          📅 {formatDate(task.deadline)}
        </div>
        {task.assignedTo && (
          <div>👤 {task.assignedTo}</div>
        )}
        <div className="flex items-center space-x-3 mt-2">
          {task.attachments?.length > 0 && (
            <span className="text-xs">📎 {task.attachments.length}</span>
          )}
          {task.comments?.length > 0 && (
            <span className="text-xs">💬 {task.comments.length}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
