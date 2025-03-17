import React, { memo, useRef, useState, useCallback, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task } from '../types';
import { formatDateTime, formatTime, formatDate } from '../utils/dateUtils';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';
import TaskStatusBadge from './TaskStatusBadge';

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
  const [hasScrollbar, setHasScrollbar] = useState(false);

  // Safety check to ensure task has a valid ID
  if (!task || !task.id) {
    console.error('TaskCard received invalid task:', task);
    return <div className="p-4 mb-3 border-l-4 border-red-500 rounded-lg bg-white shadow">Invalid task data</div>;
  }

  // Handle task status styles - memoized to avoid recreating on every render
  const getStatusBadge = useCallback(() => {
    switch (task.status) {
      case 'todo':
        return <TaskStatusBadge status="todo" />;
      case 'in-progress':
        return <TaskStatusBadge status="in-progress" />;
      case 'done':
        return <TaskStatusBadge status="done" />;
      default:
        return <TaskStatusBadge status="todo" />;
    }
  }, [task.status]);

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
  
  // Extract border color from the task's color string
  const cardBorderColor = useCallback(() => {
    if (!task.color) return 'border-gray-300';
    
    // Extract the border color from format like "bg-blue-100 border-blue-500"
    const borderColorMatch = task.color.match(/border-([a-z]+-\d+)/);
    return borderColorMatch ? borderColorMatch[0] : 'border-gray-300';
  }, [task.color]);

  // Extract background color from the task's color string
  const cardBackgroundColor = useCallback(() => {
    if (!task.color) return 'bg-white';
    
    // Extract the background color from format like "bg-blue-100 border-blue-500"
    const bgColorMatch = task.color.match(/bg-([a-z]+-\d+)/);
    return bgColorMatch ? bgColorMatch[0] : 'bg-white';
  }, [task.color]);

  // Check if description is overflowing and needs scrollbar
  useEffect(() => {
    if (cardRef.current) {
      const descriptionElem = cardRef.current.querySelector('.task-description');
      if (descriptionElem && descriptionElem.scrollHeight > descriptionElem.clientHeight) {
        setHasScrollbar(true);
      } else {
        setHasScrollbar(false);
      }
    }
  }, [task.description]);
  
  // Format date range for display
  const dateRangeText = `${formatDate(task.startTime)} - ${formatDate(task.endTime)}`;

  return (
    <Draggable 
      draggableId={task.id} 
      index={index}
      isDragDisabled={!isDraggable}
    >
      {(provided, snapshot) => (
        <div
          ref={(node) => {
            // Set both refs - the Draggable ref and our own ref
            provided.innerRef(node);
            if (cardRef) cardRef.current = node;
          }}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          data-task-id={task.id} // Add data attribute for debugging
          className={cn(
            'relative p-3 mb-2 rounded-md shadow-sm border-l-4',
            cardBorderColor(),
            cardBackgroundColor(),
            snapshot.isDragging ? 'shadow-md' : '',
            isHovered ? 'ring-2 ring-offset-1 ring-blue-400' : '',
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
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-gray-900 pr-6">{task.title}</h3>
            {getStatusBadge()}
          </div>
          
          {task.description && (
            <div 
              className={`task-description text-sm text-gray-600 mb-2 overflow-y-auto max-h-20 
                ${hasScrollbar ? 'pr-2 custom-scrollbar' : ''}`
              }
            >
              {task.description}
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {dateRangeText}
            </span>
            {task.attributes.length > 0 && (
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {task.attributes.length}
              </span>
            )}
          </div>
          
          {snapshot.isDragging && (
            <motion.div 
              className="absolute inset-0 bg-blue-500 rounded-md opacity-20"
              layoutId={`drag-overlay-${task.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
            />
          )}
        </div>
      )}
    </Draggable>
  );
});

export default TaskCard; 