import React, { memo, useRef, useState, useCallback, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task } from '../types';
import { formatDateTime, formatTime, formatDate } from '../utils/dateUtils';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  index: number;
  onEditClick: (task: Task) => void;
  isDraggable?: boolean;
}

// Prevent unnecessary re-renders with memo and by ensuring callback stability
const TaskCard: React.FC<TaskCardProps> = memo(({ 
  task, 
  index, 
  onEditClick,
  isDraggable = true
}) => {
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragActive = useRef<boolean>(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Safety check to ensure task has a valid ID
  if (!task || !task.id) {
    console.error('TaskCard received invalid task:', task);
    return <div className="p-4 mb-3 border-l-4 border-red-500 rounded-lg bg-white shadow">Invalid task data</div>;
  }

  // Memoized event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isDraggable) return;
    
    // Reset drag active state
    dragActive.current = false;
    
    // Clear any existing timer
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
    }
    
    // Set a new timer for distinguishing between click and drag
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
    }, 200); // Short delay to differentiate between click and drag
  }, [isDraggable]);
  
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // If not draggable or if we're clicking a link, just handle as a click
    if (!isDraggable) {
      onEditClick(task);
      return;
    }
    
    // If we weren't dragging (drag wasn't activated) and we have a timer, treat as a click
    if (clickTimer.current && !dragActive.current && !isDragging) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      onEditClick(task);
    }
  }, [isDraggable, isDragging, onEditClick, task]);
  
  const handleDragStart = useCallback(() => {
    dragActive.current = true;
    setIsDragging(true);
    
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
  }, []);
  
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    // Add a small delay before allowing clicks again
    setTimeout(() => {
      dragActive.current = false;
    }, 100);
  }, []);
  
  // Get the color based on task color property or fallback to status if no color is available
  const getCardColor = useCallback(() => {
    if (task.color) {
      return task.color;
    }
    
    // Fallback to status-based colors if no color property exists
    switch (task.status) {
      case 'todo':
        return 'border-yellow-400 bg-yellow-50';
      case 'in-progress':
        return 'border-green-400 bg-green-50';
      case 'done':
        return 'border-blue-400 bg-blue-50';
      default:
        return 'border-gray-300 bg-white';
    }
  }, [task.color, task.status]);

  return (
    <Draggable 
      draggableId={task.id} 
      index={index}
      isDragDisabled={!isDraggable}
    >
      {(provided, snapshot) => (
        <div
          ref={(node) => {
            provided.innerRef(node);
            if (cardRef) cardRef.current = node;
          }}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          data-task-id={task.id}
          className={cn(
            'relative p-4 mb-3 rounded-md shadow-sm border-l-4',
            getCardColor(),
            snapshot.isDragging ? 'shadow-md ring-2 ring-blue-300' : '',
            isHovered ? 'ring-1 ring-offset-1 ring-blue-400' : '',
            'transition-all duration-150 ease-in-out'
          )}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            ...provided.draggableProps.style,
            zIndex: snapshot.isDragging ? 10 : 'auto'
          }}
        >
          <div className="mb-1">
            <h3 className="font-semibold text-gray-900">{task.title}</h3>
          </div>
          
          {task.description && (
            <div className="text-sm text-gray-600 mb-3">
              {task.description}
            </div>
          )}
          
          <div className="border-t border-gray-100 pt-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Start: {formatTime(task.startTime)} {formatDate(task.startTime)}</span>
              <span>End: {formatTime(task.endTime)}</span>
            </div>
            <div className="mt-1">
              <span>Date: {formatDate(task.startTime)}</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
});

export default TaskCard; 