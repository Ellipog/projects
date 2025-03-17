import React, { memo } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Column as ColumnType, Task } from '../types';
import TaskCard from './TaskCard';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

interface ColumnProps {
  column: ColumnType;
  tasks: Task[];
  onViewTask: (task: Task) => void;
  isDraggable?: boolean;
}

const Column: React.FC<ColumnProps> = ({ 
  column, 
  tasks, 
  onViewTask,
  isDraggable = true
}) => {
  // Safety check to prevent rendering a Droppable without a valid ID
  if (!column || !column.id) {
    console.error('Column component received invalid column:', column);
    return <div className="p-4 text-red-500">Invalid column configuration</div>;
  }

  // Get column styling based on column ID/status
  const getColumnStyles = () => {
    switch (column.id) {
      case 'column-1': // Todo
        return {
          badge: 'bg-yellow-200 text-yellow-800',
          dragOver: 'bg-yellow-50/70'
        };
      case 'column-2': // In Progress
        return {
          badge: 'bg-green-200 text-green-800',
          dragOver: 'bg-green-50/70'
        };
      case 'column-3': // Done
        return {
          badge: 'bg-blue-200 text-blue-800',
          dragOver: 'bg-blue-50/70'
        };
      default:
        return {
          badge: 'bg-gray-200 text-gray-800',
          dragOver: 'bg-blue-50'
        };
    }
  };

  const styles = getColumnStyles();

  return (
    <motion.div 
      className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn(
        "px-4 py-3 -mb-3 font-medium flex items-center justify-between"
      )}>
        <div className="flex items-center">
          <span className={cn("font-semibold text-gray-800")}>{column.title}</span>
          <span className={cn("ml-2 text-xs px-2 py-0.5 rounded-full", styles.badge)}>
            {tasks.length}
          </span>
        </div>
      </div>
      <Droppable 
        droppableId={column.id} 
        isDropDisabled={!isDraggable}
        type="TASK"
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex-grow p-3 overflow-y-auto min-h-[200px] rounded-b-lg transition-all duration-200',
              snapshot.isDraggingOver ? styles.dragOver : 'bg-gray-50/50'
            )}
            data-column-id={column.id}
          >
            {tasks.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400 text-center p-4">
                  {isDraggable
                    ? 'Drag and drop tasks here'
                    : 'No tasks in this column'}
                </p>
              </div>
            ) : (
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
              >
                {tasks.map((task, index) => 
                  task ? ( // Only render if task is defined
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      index={index} 
                      onEditClick={onViewTask}
                      isDraggable={isDraggable}
                    />
                  ) : null
                )}
              </motion.div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </motion.div>
  );
};

export default memo(Column); 