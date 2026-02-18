import TaskCard from './TaskCard';

const TaskGrid = ({ tasks, onSetStatus, onSeeDetails, onSetUser, onAddCommentary }) => {
  if (tasks.length === 0) {
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
              d="M9 12h6M12 9v6M5 5h14v14H5z"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          No tasks in this view
        </h3>
        <p className="text-sm text-gray-500 max-w-md">
          Adjust the Assigned/Sent or status filters, or create a new task using the button above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onSetStatus={onSetStatus}
          onSeeDetails={onSeeDetails}
          onSetUser={onSetUser}
          onAddCommentary={onAddCommentary}
          viewMode="grid"
        />
      ))}
    </div>
  );
};

export default TaskGrid;
