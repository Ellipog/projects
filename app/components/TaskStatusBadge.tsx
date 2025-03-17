import React from 'react';

interface TaskStatusBadgeProps {
  status: 'todo' | 'in-progress' | 'done';
}

const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'todo':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          To Do
        </span>
      );
    case 'in-progress':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          In Progress
        </span>
      );
    case 'done':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Done
        </span>
      );
    default:
      return null;
  }
};

export default TaskStatusBadge; 