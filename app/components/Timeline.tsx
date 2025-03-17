'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Task } from '../types';
import { motion } from 'framer-motion';
import { formatDate, formatTime } from '../utils/dateUtils';
import { cn } from '../utils/cn';

interface TimelineProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

// Interface to track task placement information
interface TaskPlacement {
  task: Task;
  row: number;
  startTime: number;
  endTime: number;
}

const Timeline: React.FC<TimelineProps> = ({ tasks, onTaskClick }) => {
  const [sortedTasks, setSortedTasks] = useState<Task[]>([]);
  const [timelineStartDate, setTimelineStartDate] = useState<Date>(new Date());
  const [timelineEndDate, setTimelineEndDate] = useState<Date>(new Date());
  const [timelineWidth, setTimelineWidth] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(50); // px per day
  const [customDateRange, setCustomDateRange] = useState<boolean>(false);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [timeUnit, setTimeUnit] = useState<'days' | 'hours'>('days');
  const [manualTimeUnitSet, setManualTimeUnitSet] = useState<boolean>(false);
  const [taskPlacements, setTaskPlacements] = useState<TaskPlacement[]>([]);
  const [maxRow, setMaxRow] = useState<number>(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Set up timeline dates and sort tasks
  useEffect(() => {
    if (tasks.length === 0) return;
    
    // Filter out any undefined tasks
    const validTasks = tasks.filter(task => task !== undefined);
    if (validTasks.length === 0) return;
    
    // Sort tasks by start date
    const sorted = [...validTasks].sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    
    // Find earliest and latest dates among all tasks
    let earliestDate = new Date(sorted[0].startTime);
    let latestDate = new Date(sorted[0].endTime);
    
    sorted.forEach(task => {
      const startTime = new Date(task.startTime);
      const endTime = new Date(task.endTime);
      
      if (startTime < earliestDate) earliestDate = startTime;
      if (endTime > latestDate) latestDate = endTime;
    });
    
    // Only auto-determine time unit if not manually set
    if (!manualTimeUnitSet) {
      // Determine if we should use hours or days based on task durations
      const totalDurationMs = latestDate.getTime() - earliestDate.getTime();
      const totalDurationHours = totalDurationMs / (1000 * 60 * 60);
      
      // Use hours if the total duration is less than 72 hours (3 days)
      const shouldUseHours = totalDurationHours < 72;
      setTimeUnit(shouldUseHours ? 'hours' : 'days');
    }
    
    // Add padding to the timeline
    if (!customDateRange) {
      if (timeUnit === 'hours') {
        // Add 6 hours padding on each side for hours view
        earliestDate = new Date(earliestDate.getTime() - (6 * 60 * 60 * 1000));
        latestDate = new Date(latestDate.getTime() + (6 * 60 * 60 * 1000));
      } else {
        // Add 14 days padding for days view
        earliestDate.setDate(earliestDate.getDate() - 14);
        latestDate.setDate(latestDate.getDate() + 14);
      }
      
      // Set formatted dates for custom inputs
      setCustomStartDate(formatDateForInput(earliestDate));
      setCustomEndDate(formatDateForInput(latestDate));
    }
    
    setTimelineStartDate(earliestDate);
    setTimelineEndDate(latestDate);
    setSortedTasks(sorted);
    
    // Calculate timeline width based on time unit
    if (timeUnit === 'hours') {
      const totalHours = Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60));
      setTimelineWidth(totalHours * zoomLevel * 0.8); // 0.8x zoom for hours to fit more
    } else {
      const totalDays = Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24));
      setTimelineWidth(totalDays * zoomLevel);
    }
    
    // Calculate task placements to avoid overlaps
    calculateTaskPlacements(sorted, earliestDate, latestDate);
  }, [tasks, zoomLevel, customDateRange, timeUnit, manualTimeUnitSet]);
  
  // Calculate task placements to avoid overlaps
  const calculateTaskPlacements = (tasks: Task[], startDate: Date, endDate: Date) => {
    if (!tasks || tasks.length === 0) return;
    
    // Convert tasks to placement objects with valid time values
    const placements: TaskPlacement[] = tasks.map(task => {
      // Ensure we have valid Date objects
      const start = new Date(task.startTime);
      const end = new Date(task.endTime);
      
      return {
        task,
        row: 0,
        startTime: start.getTime(),
        endTime: end.getTime()
      };
    });
    
    // Sort strictly by start time
    placements.sort((a, b) => a.startTime - b.startTime);
    
    // Simple greedy algorithm for row assignment
    // For each row, keep track of the last assigned task's end time
    const rowLastEndTime: number[] = [];
    
    // Assign each task to the first available row
    placements.forEach(placement => {
      let assignedRow = 0;
      
      // Find the first row where this task doesn't overlap
      while (true) {
        // If we haven't used this row yet or if the row's last task ends before this one starts
        if (rowLastEndTime[assignedRow] === undefined || 
            // Add a 1ms buffer to ensure no exact overlapping boundaries
            rowLastEndTime[assignedRow] + 1 <= placement.startTime) {
          break;
        }
        
        // Try the next row
        assignedRow++;
      }
      
      // Assign this task to the found row
      placement.row = assignedRow;
      
      // Update the row's last end time
      rowLastEndTime[assignedRow] = placement.endTime;
    });
    
    // Find the highest row used
    const highestRow = rowLastEndTime.length > 0 ? rowLastEndTime.length - 1 : 0;
    
    setTaskPlacements(placements);
    setMaxRow(highestRow);
  };
  
  // Calculate the height needed for the timeline content based on the number of rows
  const timelineContentHeight = useMemo(() => {
    const baseHeight = 40; // Base height for timeline markers
    const rowHeight = 48; // Height per row of tasks (increased from 36px)
    const padding = 20; // Bottom padding
    
    return baseHeight + ((maxRow + 1) * rowHeight) + padding;
  }, [maxRow]);
  
  // Helper to format date for input fields
  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  
  // Helper to format date with time for display
  const formatDateWithTime = (date: Date): string => {
    return `${formatDate(date)} ${formatTime(date)}`;
  };
  
  // Apply custom date range
  const applyCustomDateRange = () => {
    if (!customStartDate || !customEndDate) return;
    
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    
    // For custom time inputs
    const startTimeInput = document.getElementById('startTime') as HTMLInputElement;
    const endTimeInput = document.getElementById('endTime') as HTMLInputElement;
    
    if (startTimeInput?.value) {
      const [hours, minutes] = startTimeInput.value.split(':').map(Number);
      start.setHours(hours, minutes, 0, 0);
    }
    
    if (endTimeInput?.value) {
      const [hours, minutes] = endTimeInput.value.split(':').map(Number);
      end.setHours(hours, minutes, 0, 0);
    }
    
    // Validate dates
    if (start >= end) {
      alert('End date must be after start date');
      return;
    }
    
    setTimelineStartDate(start);
    setTimelineEndDate(end);
    setCustomDateRange(true);
    
    // Use the helper to update timeline width with current zoom level
    setTimeout(() => updateTimelineWidth(zoomLevel), 0);
    
    // Recalculate task placements with new date range
    calculateTaskPlacements(sortedTasks, start, end);
  };
  
  // Reset to automatic date range
  const resetDateRange = () => {
    setCustomDateRange(false);
    
    // This will trigger the useEffect to recalculate
    setSortedTasks([...sortedTasks]);
  };
  
  // Toggle between hours and days view
  const toggleTimeUnit = () => {
    // Toggle the time unit
    const newTimeUnit = timeUnit === 'days' ? 'hours' : 'days';
    
    // Set appropriate zoom level based on time unit
    const newZoomLevel = newTimeUnit === 'hours' ? 30 : 50;
    
    // Force recalculation
    setTimeUnit(newTimeUnit);
    setZoomLevel(newZoomLevel);
    setManualTimeUnitSet(true);
    
    // Adjust dates based on new time unit if needed
    let adjustedStart = new Date(timelineStartDate);
    let adjustedEnd = new Date(timelineEndDate);
    
    if (newTimeUnit === 'hours') {
      // If switching to hours, narrow the range to focus on recent tasks
      const midpoint = new Date((adjustedStart.getTime() + adjustedEnd.getTime()) / 2);
      adjustedStart = new Date(midpoint.getTime() - (36 * 60 * 60 * 1000)); // 36 hours before midpoint
      adjustedEnd = new Date(midpoint.getTime() + (36 * 60 * 60 * 1000)); // 36 hours after midpoint
    } else {
      // If switching to days, ensure we have a good range of days
      adjustedStart = new Date(adjustedStart.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 days before
      adjustedEnd = new Date(adjustedEnd.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days after
    }
    
    // Update dates and format custom date inputs
    setTimelineStartDate(adjustedStart);
    setTimelineEndDate(adjustedEnd);
    setCustomStartDate(formatDateForInput(adjustedStart));
    setCustomEndDate(formatDateForInput(adjustedEnd));
    
    // Force immediate recalculation to prevent overlapping
    setTimeout(() => {
      updateTimelineWidth(newZoomLevel);
      calculateTaskPlacements(sortedTasks, adjustedStart, adjustedEnd);
    }, 0);
  };
  
  // Helper function to update timeline width based on zoom level
  const updateTimelineWidth = (zoom: number) => {
    if (timeUnit === 'hours') {
      const totalHours = Math.ceil((timelineEndDate.getTime() - timelineStartDate.getTime()) / (1000 * 60 * 60));
      setTimelineWidth(totalHours * zoom * 0.8); // 0.8x zoom for hours to fit more
    } else {
      const totalDays = Math.ceil((timelineEndDate.getTime() - timelineStartDate.getTime()) / (1000 * 60 * 60 * 24));
      setTimelineWidth(totalDays * zoom);
    }
  };
  
  // Fit timeline to container width
  const fitToScreen = () => {
    if (!timelineRef.current) return;
    
    const containerWidth = timelineRef.current.offsetWidth - 32; // Subtract padding
    let newZoom;
    
    if (timeUnit === 'hours') {
      const totalHours = Math.ceil((timelineEndDate.getTime() - timelineStartDate.getTime()) / (1000 * 60 * 60));
      newZoom = Math.floor((containerWidth / totalHours) * 1.25); // Adjust for hours view
      newZoom = Math.max(20, Math.min(newZoom, 150));
    } else {
      const totalDays = Math.ceil((timelineEndDate.getTime() - timelineStartDate.getTime()) / (1000 * 60 * 60 * 24));
      newZoom = Math.floor(containerWidth / totalDays);
      newZoom = Math.max(25, Math.min(newZoom, 100));
    }
    
    setZoomLevel(newZoom);
    updateTimelineWidth(newZoom);
  };
  
  // Auto-fit on initial render
  useEffect(() => {
    if (timelineRef.current && tasks.length > 0) {
      fitToScreen();
    }
  }, [sortedTasks, timeUnit]);
  
  // Calculate position for a task on the timeline
  const getTaskPosition = (placement: TaskPlacement) => {
    const timelineStart = timelineStartDate.getTime();
    const timelineEnd = timelineEndDate.getTime();
    const timelineDuration = timelineEnd - timelineStart;
    
    // Calculate left position as percentage
    const leftPosition = ((placement.startTime - timelineStart) / timelineDuration) * 100;
    
    // Calculate width as percentage
    const taskDuration = placement.endTime - placement.startTime;
    const widthPercentage = (taskDuration / timelineDuration) * 100;
    
    // Calculate top position based on row (48px per row)
    // Add 3px offset to center within the grid line
    const topPosition = (placement.row * 48) + 3;
    
    return {
      left: `${leftPosition}%`,
      width: `${widthPercentage}%`,
      top: `${topPosition}px`,
    };
  };
  
  // Generate month markers
  const generateMonthMarkers = () => {
    if (!timelineStartDate || !timelineEndDate || timeUnit === 'hours') return [];
    
    const markers = [];
    let currentDate = new Date(timelineStartDate);
    currentDate.setDate(1); // Start at the beginning of a month
    
    while (currentDate <= timelineEndDate) {
      const position = getPositionForDate(currentDate);
      
      markers.push({
        date: new Date(currentDate),
        position,
      });
      
      // Move to the next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return markers;
  };
  
  // Generate day markers
  const generateDayMarkers = () => {
    if (!timelineStartDate || !timelineEndDate || (timeUnit === 'hours' && zoomLevel < 40)) return [];
    
    const markers = [];
    let currentDate = new Date(timelineStartDate);
    currentDate.setHours(0, 0, 0, 0); // Start at beginning of day
    
    while (currentDate <= timelineEndDate) {
      const position = getPositionForDate(currentDate);
      
      // Only add day markers if they're not too crowded or we're in hours view
      if (timeUnit === 'hours' || zoomLevel >= 75 || currentDate.getDate() % 5 === 0) {
        markers.push({
          date: new Date(currentDate),
          position,
        });
      }
      
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return markers;
  };
  
  // Generate hour markers
  const generateHourMarkers = () => {
    if (!timelineStartDate || !timelineEndDate || timeUnit !== 'hours') return [];
    
    const markers = [];
    let currentDate = new Date(timelineStartDate);
    currentDate.setMinutes(0, 0, 0); // Start at the top of the hour
    
    while (currentDate <= timelineEndDate) {
      const position = getPositionForDate(currentDate);
      
      // Add hour markers based on zoom level
      if (zoomLevel >= 30 || currentDate.getHours() % 3 === 0) {
        markers.push({
          date: new Date(currentDate),
          position,
          isEvenHour: currentDate.getHours() % 2 === 0,
        });
      }
      
      // Move to the next hour
      currentDate.setTime(currentDate.getTime() + (60 * 60 * 1000));
    }
    
    return markers;
  };
  
  const getPositionForDate = (date: Date) => {
    const dateTime = date.getTime();
    const timelineStart = timelineStartDate.getTime();
    const timelineEnd = timelineEndDate.getTime();
    const timelineDuration = timelineEnd - timelineStart;
    
    return ((dateTime - timelineStart) / timelineDuration) * 100;
  };
  
  // Get task color based on task color property or fallback to status
  const getTaskColor = (task: Task) => {
    if (task.color) {
      return task.color;
    }
    
    // Fallback to status-based colors if no color property exists
    switch (task.status) {
      case 'todo':
        return 'bg-yellow-100 border-yellow-400';
      case 'in-progress':
        return 'bg-green-100 border-green-400';
      case 'done':
        return 'bg-blue-100 border-blue-400';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };
  
  // Render markers and tasks
  const monthMarkers = generateMonthMarkers();
  const dayMarkers = generateDayMarkers();
  const hourMarkers = generateHourMarkers();
  
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-gray-50 rounded-lg border border-gray-200 mt-8">
        <p className="text-gray-400">No tasks to display on the timeline</p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden" ref={timelineRef}>
      <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-indigo-100 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            Timeline View
          </h3>
          
          <div className="flex items-center gap-3">
            {/* Time unit toggle button */}
            <button 
              onClick={toggleTimeUnit}
              className="px-2.5 py-1.5 text-xs font-medium bg-white border border-indigo-200 text-indigo-600 rounded-md hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-sm"
            >
              {timeUnit === 'days' ? 'Switch to Hours' : 'Switch to Days'}
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="font-medium text-gray-600">
            {timeUnit === 'hours' 
              ? `${formatDateWithTime(timelineStartDate)} — ${formatDateWithTime(timelineEndDate)}`
              : `${formatDate(timelineStartDate)} — ${formatDate(timelineEndDate)}`
            }
          </span>
          
          {/* Date range controls */}
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <div className="flex items-center gap-1.5">
              <input 
                type="date" 
                id="startDate"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 outline-none"
              />
              {timeUnit === 'hours' && (
                <input 
                  type="time" 
                  id="startTime"
                  defaultValue="00:00"
                  className="text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 outline-none"
                />
              )}
            </div>
            
            <span className="text-gray-400">to</span>
            
            <div className="flex items-center gap-1.5">
              <input 
                type="date" 
                id="endDate"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 outline-none"
              />
              {timeUnit === 'hours' && (
                <input 
                  type="time" 
                  id="endTime"
                  defaultValue="23:59"
                  className="text-xs border border-gray-200 rounded-md px-2 py-1.5 focus:ring-1 focus:ring-indigo-300 focus:border-indigo-300 outline-none"
                />
              )}
            </div>
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={applyCustomDateRange}
                className="px-2.5 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors shadow-sm"
              >
                Apply
              </button>
              
              {customDateRange && (
                <button 
                  onClick={resetDateRange}
                  className="px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto pb-4 bg-gray-50/50">
        <div className="relative p-4" style={{ minWidth: '100%', width: `${Math.max(timelineWidth, 800)}px` }}>
          {/* Markers and grid */}
          <div className="relative z-10">
            {/* Month markers */}
            {monthMarkers.length > 0 && (
              <div className="absolute top-0 left-0 right-0 h-8 flex">
                {monthMarkers.map((marker, index) => (
                  <div 
                    key={`month-${index}`}
                    className="absolute h-full border-l border-indigo-200 flex flex-col items-center"
                    style={{ left: marker.position + '%' }}
                  >
                    <span className="text-xs font-medium text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {marker.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Day markers */}
            {dayMarkers.length > 0 && (
              <div className="absolute top-8 left-0 right-0 h-6 flex">
                {dayMarkers.map((marker, index) => (
                  <div 
                    key={`day-${index}`}
                    className="absolute h-full border-l border-gray-200 flex flex-col items-center"
                    style={{ left: marker.position + '%' }}
                  >
                    <span className="text-xs text-gray-500">
                      {marker.date.getDate()}
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Hour markers */}
            {hourMarkers.length > 0 && (
              <div className="absolute top-0 left-0 right-0 h-8 flex">
                {hourMarkers.map((marker, index) => (
                  <div 
                    key={`hour-${index}`}
                    className={cn(
                      "absolute h-full border-l flex flex-col items-center",
                      marker.isEvenHour ? "border-indigo-200" : "border-gray-200"
                    )}
                    style={{ left: marker.position + '%' }}
                  >
                    <span className={cn(
                      "text-xs px-1 py-0.5 rounded",
                      marker.isEvenHour ? "font-medium text-indigo-800 bg-indigo-50" : "text-gray-500"
                    )}>
                      {marker.date.getHours()}:00
                    </span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Grid lines for rows (horizontal) */}
            <div className="absolute top-14 left-0 right-0" style={{ height: `${timelineContentHeight}px` }}>
              {Array.from({ length: maxRow + 2 }).map((_, index) => (
                <div 
                  key={`grid-row-${index}`}
                  className="absolute w-full border-t border-gray-100"
                  style={{ top: `${index * 48}px` }}
                />
              ))}
            </div>
          </div>
          
          {/* Tasks - with proper vertical positioning */}
          <div 
            className="relative mt-14 pointer-events-none"
            style={{ height: `${timelineContentHeight}px` }}
          >
            {taskPlacements.map(placement => (
              <motion.div
                key={placement.task.id}
                className={cn(
                  "absolute py-1.5 px-3 rounded-md border shadow-sm cursor-pointer overflow-hidden flex flex-col justify-between transition-all pointer-events-auto",
                  getTaskColor(placement.task)
                )}
                style={{
                  ...getTaskPosition(placement),
                  height: '42px',
                  minWidth: '0',
                  maxWidth: `${((placement.task.endTime.getTime() - placement.task.startTime.getTime()) / (timelineEndDate.getTime() - timelineStartDate.getTime())) * 100}%`,
                  willChange: 'transform, box-shadow, z-index, height, top'
                }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ 
                  y: -3, 
                  zIndex: 50,
                  boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                  height: '46px',
                  top: `${(placement.row * 48) - 1}px`, // Adjust top position to compensate for increased height
                  maxWidth: `${((placement.task.endTime.getTime() - placement.task.startTime.getTime()) / (timelineEndDate.getTime() - timelineStartDate.getTime())) * 100}%`,
                  scale: 1.01,
                  transition: { duration: 0.15, ease: "easeOut" }
                }}
                onClick={() => onTaskClick(placement.task)}
              >
                <div className="text-xs font-medium truncate max-w-full line-clamp-1 text-gray-800">
                  {placement.task.title}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {timeUnit === 'hours' 
                    ? `${formatTime(placement.task.startTime)} - ${formatTime(placement.task.endTime)}`
                    : `${formatDate(placement.task.startTime)} - ${formatDate(placement.task.endTime)}`
                  }
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Timeline base line */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-indigo-200"></div>
        </div>
      </div>
    </div>
  );
};

export default Timeline; 