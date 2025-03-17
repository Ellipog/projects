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

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-md shadow-sm">
      <div className="px-4 py-3 bg-gray-100 font-semibold text-gray-800 rounded-t-md">
        {column.title}
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
              'flex-grow p-3 overflow-y-auto min-h-[100px] rounded-b-md transition-colors duration-200',
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
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
    </div>
  );
};

export default memo(Column); 