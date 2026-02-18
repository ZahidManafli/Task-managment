import TaskCard from './TaskCard';

const TaskList = ({ tasks, onSetStatus, onSeeDetails, onSetUser, onAddCommentary }) => {
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
              d="M5 7h14M5 12h9M5 17h6"
            />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          No tasks in this list
        </h3>
        <p className="text-sm text-gray-500 max-w-md">
          Try switching to another filter or create a new task to start tracking your work.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onSetStatus={onSetStatus}
          onSeeDetails={onSeeDetails}
          onSetUser={onSetUser}
          onAddCommentary={onAddCommentary}
          viewMode="list"
        />
      ))}
    </div>
  );
};

export default TaskList;
