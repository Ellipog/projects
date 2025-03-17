import React, { useState, useEffect, memo, useCallback, useRef } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import Column from './Column';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail';
import PresetTaskSelector from './PresetTaskSelector';
import { RoadmapData, Task, Column as ColumnType } from '../types';
import defaultInitialData from '../mock-data';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import Timeline from './Timeline';
import { cn } from '../utils/cn';
import { useToast } from './Toast';

interface RoadmapProps {
  initialData?: any; // The roadmap data from the database
  canEdit?: boolean; // Whether the user has permission to edit
}

// Define column structure type to avoid indexing errors
type ColumnId = 'column-1' | 'column-2' | 'column-3';
type ColumnStructure = {
  [key in ColumnId]: {
    id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
  };
};

const COLUMN_STRUCTURE: ColumnStructure = {
  'column-1': { id: 'column-1', title: 'To Do', status: 'todo' },
  'column-2': { id: 'column-2', title: 'In Progress', status: 'in-progress' },
  'column-3': { id: 'column-3', title: 'Done', status: 'done' }
};

const COLUMN_ORDER: ColumnId[] = ['column-1', 'column-2', 'column-3'];

// Available task colors
const TASK_COLORS = [
  'bg-blue-100 border-blue-500',
  'bg-green-100 border-green-500',
  'bg-purple-100 border-purple-500',
  'bg-yellow-100 border-yellow-500',
  'bg-red-100 border-red-500',
  'bg-pink-100 border-pink-500',
  'bg-indigo-100 border-indigo-500',
  'bg-teal-100 border-teal-500'
];

// Utility function to get a random color for a task
const getRandomTaskColor = (): string => {
  const randomIndex = Math.floor(Math.random() * TASK_COLORS.length);
  return TASK_COLORS[randomIndex];
};

const Roadmap: React.FC<RoadmapProps> = ({ 
  initialData = defaultInitialData,
  canEdit = true 
}) => {
  // State initialization
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'timeline'>('kanban');
  const [filterOptions, setFilterOptions] = useState({
    searchTerm: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    status: [] as string[]
  });
  const toast = useToast();
  
  // Initialize data state with proper column structure
  const [data, setData] = useState<RoadmapData>(() => {
    // Ensure proper structure regardless of what comes in
    const defaultColumns: Record<ColumnId, ColumnType> = {
      'column-1': { ...COLUMN_STRUCTURE['column-1'], taskIds: [] },
      'column-2': { ...COLUMN_STRUCTURE['column-2'], taskIds: [] },
      'column-3': { ...COLUMN_STRUCTURE['column-3'], taskIds: [] }
    };
    
    // Try to use passed initialData if it has valid structure
    if (initialData?.columns && initialData?.columnOrder) {
      console.log("Initializing with data from props");
      
      // Ensure all three required columns exist
      const mergedColumns = {
        ...defaultColumns,
        ...initialData.columns
      };
      
      // Ensure all columns have proper id and taskIds array
      Object.keys(mergedColumns).forEach(colId => {
        if (!mergedColumns[colId].id) {
          mergedColumns[colId].id = colId;
        }
        if (!Array.isArray(mergedColumns[colId].taskIds)) {
          mergedColumns[colId].taskIds = [];
        }
      });
      
      return {
        tasks: initialData.tasks || {},
        columns: mergedColumns,
        columnOrder: COLUMN_ORDER, // Always use consistent column order
        presetTasks: defaultInitialData.presetTasks
      };
    } else {
      console.log("Using default mock data");
      return defaultInitialData;
    }
  });

  // Map status to column ID
  const getColumnIdFromStatus = useCallback((status: 'todo' | 'in-progress' | 'done'): ColumnId => {
    switch (status) {
      case 'todo': return 'column-1';
      case 'in-progress': return 'column-2';
      case 'done': return 'column-3';
      default: return 'column-1';
    }
  }, []);
  
  // Map column ID to status
  const getStatusFromColumnId = useCallback((columnId: string): 'todo' | 'in-progress' | 'done' => {
    switch (columnId) {
      case 'column-1': return 'todo';
      case 'column-2': return 'in-progress';
      case 'column-3': return 'done';
      default: return 'todo';
    }
  }, []);

  // Helper to distribute tasks to columns based on their status
  const distributeTasksToColumns = useCallback((tasks: Record<string, Task>) => {
    // Create new columns with empty task arrays
    const newColumns: Record<ColumnId, ColumnType> = {
      'column-1': { ...COLUMN_STRUCTURE['column-1'], taskIds: [] },
      'column-2': { ...COLUMN_STRUCTURE['column-2'], taskIds: [] },
      'column-3': { ...COLUMN_STRUCTURE['column-3'], taskIds: [] }
    };
    
    // Distribute tasks to their columns based on status
    Object.entries(tasks).forEach(([taskId, task]) => {
      const columnId = getColumnIdFromStatus(task.status);
      newColumns[columnId].taskIds.push(taskId);
    });
    
    // Update state with new data
    setData(prevData => ({
      ...prevData,
      tasks,
      columns: newColumns,
      columnOrder: COLUMN_ORDER
    }));
  }, [getColumnIdFromStatus]);
  
  // Save changes to backend
  const saveChanges = async (dataToSave = data) => {
    if (isSaving) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Simulating API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, this would be an API call
      // const response = await fetch('/api/roadmap', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(dataToSave),
      // });
      
      // if (!response.ok) throw new Error('Failed to save changes');
      
      // Display success toast instead of inline notification
      toast.success('Changes saved successfully');
      
      localStorage.setItem('roadmapData', JSON.stringify(dataToSave));
      return { success: true };
    } catch (error) {
      console.error('Error saving changes:', error);
      setSaveError('Failed to save changes. Please try again.');
      
      // Display error toast
      toast.error('Failed to save changes. Please try again.');
      
      return { success: false, error };
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle drag and drop
  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // Exit if invalid drop
    if (!destination || !draggableId) return;
    
    // Skip if dropped in the same position
    if (destination.droppableId === source.droppableId && 
        destination.index === source.index) {
      return;
    }
    
    // Get the task
    const task = data.tasks[draggableId];
    if (!task) {
      console.error('Task not found:', draggableId);
      return;
    }
    
    // Create a deep copy of the data to avoid mutations
    const newData = JSON.parse(JSON.stringify(data)) as RoadmapData;
    
    // Remove task from source column
    const sourceTaskIds = [...newData.columns[source.droppableId].taskIds];
    sourceTaskIds.splice(source.index, 1);
    newData.columns[source.droppableId].taskIds = sourceTaskIds;
    
    // Add task to destination column
    const destTaskIds = [...newData.columns[destination.droppableId].taskIds];
    destTaskIds.splice(destination.index, 0, draggableId);
    newData.columns[destination.droppableId].taskIds = destTaskIds;
    
    // Update task status if column changed
    if (source.droppableId !== destination.droppableId) {
      const newStatus = getStatusFromColumnId(destination.droppableId);
      newData.tasks[draggableId].status = newStatus;
    }
    
    // Update state
    setData(newData);
    
    // Save changes to backend
    saveChanges(newData).catch(err => {
      console.error('Failed to save changes:', err);
      setData(data); // Roll back on error
    });
  }, [data, getStatusFromColumnId, saveChanges]);

  // Fetch tasks for this roadmap
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchTasks = async () => {
      // If no roadmap ID, just use default data
      if (!initialData || !initialData._id) {
        console.log("No roadmap ID, using mock data");
        setIsLoading(false);
        return;
      }
      
      // Try to load from cache first
      try {
        const cacheKey = `roadmap_tasks_${initialData._id}`;
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
        
        if (cachedData && cacheTimestamp && 
            (Date.now() - parseInt(cacheTimestamp)) < CACHE_TTL) {
          console.log("Using cached data");
          const parsedData = JSON.parse(cachedData);
          
          // Parse dates from strings
          Object.values(parsedData.tasks || {}).forEach((task: any) => {
            task.startTime = new Date(task.startTime);
            task.endTime = new Date(task.endTime);
          });
          
          distributeTasksToColumns(parsedData.tasks || {});
          setIsLoading(false);
          return;
        }
        
        // Fetch from API if no cache
        console.log("Fetching tasks from API");
        const response = await fetch(`/api/tasks?roadmapId=${initialData._id}`, {
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data && isMounted) {
          // Process tasks and update state
          const tasksObject: Record<string, Task> = {};
          
          // Convert API data to our format
          result.data.forEach((task: any) => {
            // Ensure valid status
            let status: 'todo' | 'in-progress' | 'done' = 'todo';
            if (['todo', 'in-progress', 'done'].includes(task.status)) {
              status = task.status as 'todo' | 'in-progress' | 'done';
            }
            
            tasksObject[task._id] = {
              id: task._id,
              title: task.title,
              description: task.description,
              startTime: new Date(task.startTime),
              endTime: new Date(task.endTime),
              status,
              color: task.color || '',
              comments: Array.isArray(task.comments) ? task.comments : [],
              attributes: Array.isArray(task.attributes) ? task.attributes : []
            };
          });
          
          // Distribute tasks to columns
          distributeTasksToColumns(tasksObject);
          
          // Cache the results
          try {
            localStorage.setItem(cacheKey, JSON.stringify({
              tasks: tasksObject
            }));
            localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
          } catch (e) {
            console.warn("Failed to cache roadmap data", e);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError' && isMounted) {
          console.error("Error fetching tasks:", error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchTasks();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [initialData, getColumnIdFromStatus, distributeTasksToColumns]);
  
  // Add a new task
  const handleAddTask = async (taskData: Omit<Task, 'id' | 'status'>) => {
    if (isSaving) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Deep clone current data
      const newData = JSON.parse(JSON.stringify(data)) as RoadmapData;
      
      // Create payload
      const payload = {
        ...taskData,
        status: 'todo' as const // Default status for new tasks
      };
      
      // In a real app, this would be an API call
      // Simulate an API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate a unique ID (in a real app, this would come from the backend)
      const uniqueId = `task-${Date.now()}`;
      
      // Simulate API response
      const result = {
        success: true,
        data: {
          _id: uniqueId,
          ...payload,
          comments: [],
          attributes: []
        }
      };
      
      if (result.success && result.data) {
        const savedTask = result.data;
        
        // Create task object
        const taskObj: Task = {
          id: savedTask._id,
          title: savedTask.title,
          description: savedTask.description,
          startTime: new Date(savedTask.startTime),
          endTime: new Date(savedTask.endTime),
          status: savedTask.status,
          // Ensure the color is preserved from the payload
          color: savedTask.color || payload.color,
          comments: savedTask.comments || [],
          attributes: savedTask.attributes || []
        };
        
        // Add to state
        newData.tasks[taskObj.id] = taskObj;
        
        // Add to appropriate column
        const columnId = getColumnIdFromStatus(taskObj.status);
        newData.columns[columnId].taskIds.push(taskObj.id);
        
        setData(newData);
        setShowForm(false);
        setEditingTask(null);
        
        // Show success toast
        toast.success('Task created successfully');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      // Show error toast
      toast.error('Failed to save task');
      setSaveError('Failed to save task');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Delete a task
  const handleDeleteTask = async (taskId: string) => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      // Remove from state
      const newData = { ...data };
      
      // Remove from columns
      Object.values(newData.columns).forEach(column => {
        column.taskIds = column.taskIds.filter(id => id !== taskId);
      });
      
      // Remove from tasks
      const { [taskId]: _, ...remainingTasks } = newData.tasks;
      newData.tasks = remainingTasks;
      
      setData(newData);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error deleting task:', error);
      setSaveError('Failed to delete task');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Update a task
  const handleUpdateTask = async (updatedTask: Task) => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      // Update local state
      const newData = { ...data };
      const oldTask = newData.tasks[updatedTask.id];
      newData.tasks[updatedTask.id] = updatedTask;
      
      // If status changed, move between columns
      if (oldTask.status !== updatedTask.status) {
        // Remove from old column
        const oldColumnId = getColumnIdFromStatus(oldTask.status);
        newData.columns[oldColumnId].taskIds = 
          newData.columns[oldColumnId].taskIds.filter(id => id !== updatedTask.id);
        
        // Add to new column
        const newColumnId = getColumnIdFromStatus(updatedTask.status);
        newData.columns[newColumnId].taskIds.push(updatedTask.id);
      }
      
      setData(newData);
      setSelectedTask(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      setSaveError('Failed to update task');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Other event handlers
  const handleViewTask = (task: Task) => setSelectedTask(task);
  
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedTask(null);
    setShowForm(true);
  };
  
  const handleSelectPreset = (preset: Omit<Task, 'id' | 'status'>) => {
    handleAddTask({
      ...preset,
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000) // 1 hour later
    });
    setShowPresetSelector(false);
  };
  
  const handleCreatePreset = (task: Omit<Task, 'id' | 'status'>) => {
    const presetId = `preset-${Date.now()}`;
    const newPreset: Omit<Task, 'id' | 'status'> = {
      title: task.title,
      description: task.description,
      startTime: new Date(),
      endTime: new Date(),
      color: task.color || '',
      comments: [],
      attributes: task.attributes || []
    };
    
    setData({
      ...data,
      presetTasks: {
        ...data.presetTasks,
        [presetId]: newPreset
      }
    });
    setShowPresetSelector(false);
  };
  
  // Reset column structure and redistribute tasks
  const handleRedistributeTasks = useCallback(() => {
    distributeTasksToColumns(data.tasks);
  }, [data.tasks, distributeTasksToColumns]);

  // Render the component
  return (
    <div className="h-full">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Project Roadmap</h1>
        {canEdit && (
          <motion.button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Add New Task
          </motion.button>
        )}
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-3 gap-6">
          {data.columnOrder.map(columnId => {
            const column = data.columns[columnId];
            const tasksForColumn = column.taskIds
              .map(taskId => data.tasks[taskId])
              .filter(task => task !== undefined); // Filter out any undefined tasks
            return (
              <Column
                key={column.id}
                column={column}
                tasks={tasksForColumn}
                onViewTask={handleViewTask}
                isDraggable={canEdit}
              />
            );
          })}
        </div>
      </DragDropContext>
      
      {/* Timeline View */}
      <Timeline 
        tasks={Object.values(data.tasks)} 
        onTaskClick={handleViewTask} 
      />
      
      {/* Add form modal */}
      {showForm && (
        <TaskForm
          onCancel={() => setShowForm(false)}
          onSubmit={handleAddTask}
          initialTask={editingTask || undefined}
        />
      )}
      
      {/* Task details modal */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={handleUpdateTask}
          onDelete={handleDeleteTask}
          isLoading={isSaving}
          readOnly={!canEdit}
        />
      )}
      
      {/* Edit form modal */}
      {editingTask && (
        <TaskForm
          onCancel={() => setEditingTask(null)}
          onSubmit={(taskData) => {
            handleUpdateTask({ ...editingTask, ...taskData });
            setEditingTask(null);
          }}
          initialTask={editingTask}
        />
      )}
      
      {/* Preset selector modal */}
      {showPresetSelector && (
        <PresetTaskSelector
          presets={Object.entries(data.presetTasks).map(([id, task]) => ({
            id,
            ...task
          }))}
          onSelect={handleSelectPreset}
          onCreate={handleCreatePreset}
          onCancel={() => setShowPresetSelector(false)}
        />
      )}
    </div>
  );
};

export default memo(Roadmap); 