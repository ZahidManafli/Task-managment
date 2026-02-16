import TaskCard from './TaskCard';

const TaskGrid = ({ tasks, onSetStatus, onSeeDetails, onSetUser, onAddCommentary }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tasks found. Create your first task to get started!</p>
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
