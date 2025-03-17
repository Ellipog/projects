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

  // Get appropriate icon based on task status
  const getStatusIcon = useCallback(() => {
    switch (task.status) {
      case 'todo':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'in-progress':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'done':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return null;
    }
  }, [task.status]);

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
            'relative p-4 mb-3 rounded-lg border-l-4 bg-white',
            getCardColor(),
            snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-300' : 'shadow-sm',
            isHovered ? 'shadow-md ring-1 ring-offset-1 ring-blue-400' : '',
            'transition-all duration-200 ease-out cursor-pointer'
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
          {/* Task header with title and status icon */}
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900 text-sm mr-2">{task.title}</h3>
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon()}
            </div>
          </div>
          
          {/* Task description - truncated with ellipsis */}
          {task.description && (
            <div className="text-xs text-gray-600 mb-3 line-clamp-2">
              {task.description}
            </div>
          )}
          
          {/* Time information with improved layout */}
          <div className="pt-2 text-xs text-gray-500 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-1">
              <div className="flex items-center">
                <svg className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(task.startTime)}</span>
              </div>
              <div className="flex items-center justify-end">
                <svg className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatTime(task.startTime)}</span>
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="flex items-center">
                <svg className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {task.attributes.length > 0 ? `${task.attributes.length} attribute${task.attributes.length > 1 ? 's' : ''}` : 'No attributes'}
              </span>
              <span className="flex items-center">
                {task.comments && task.comments.length > 0 && (
                  <>
                    <svg className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    {task.comments.length}
                  </>
                )}
              </span>
            </div>
          </div>
          
          {/* Priority indicator - optional addition */}
          {task.attributes?.some(attr => attr.name.toLowerCase() === 'priority' && ['high', 'medium', 'low'].includes(attr.value.toLowerCase())) && (
            <div 
              className={cn(
                "absolute top-0 right-0 h-5 w-5 rounded-bl-md",
                task.attributes.find(attr => attr.name.toLowerCase() === 'priority')?.value.toLowerCase() === 'high' 
                  ? "bg-red-500" 
                  : task.attributes.find(attr => attr.name.toLowerCase() === 'priority')?.value.toLowerCase() === 'medium'
                    ? "bg-yellow-500"
                    : "bg-green-500"
              )}
            />
          )}
        </div>
      )}
    </Draggable>
  );
});

export default TaskCard; 