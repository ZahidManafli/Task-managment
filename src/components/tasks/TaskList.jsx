import TaskCard from './TaskCard';

const TaskList = ({ tasks, onSetStatus, onSeeDetails, onSetUser, onAddCommentary }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tasks found. Create your first task to get started!</p>
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
