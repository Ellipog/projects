'use client';

import React, { useState, FormEvent, useEffect, useCallback, useRef } from 'react';
import { Task, Comment, Attribute } from '../types';
import { formatDateTime, createDateTimeString } from '../utils/dateUtils';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskModalProps {
  task?: Task;
  onClose: () => void;
  onSubmit: (taskData: Omit<Task, 'id' | 'status'> | Task) => void;
  onDelete?: (taskId: string) => void;
  isLoading?: boolean;
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  task, 
  onClose, 
  onSubmit,
  onDelete,
  isLoading = false
}) => {
  // State for all editable fields
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [startDate, setStartDate] = useState(
    task?.startTime 
      ? new Date(task.startTime).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(
    task?.startTime 
      ? `${new Date(task.startTime).getHours().toString().padStart(2, '0')}:${new Date(task.startTime).getMinutes().toString().padStart(2, '0')}` 
      : '09:00'
  );
  const [endDate, setEndDate] = useState(
    task?.endTime 
      ? new Date(task.endTime).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [endTime, setEndTime] = useState(
    task?.endTime 
      ? `${new Date(task.endTime).getHours().toString().padStart(2, '0')}:${new Date(task.endTime).getMinutes().toString().padStart(2, '0')}` 
      : '17:00'
  );
  const [color, setColor] = useState(task?.color || 'bg-blue-200 border-blue-600');
  const [attributes, setAttributes] = useState<Attribute[]>(task?.attributes || []);
  
  // Keep comment state but hide UI temporarily
  const [comments, setComments] = useState<Comment[]>(task?.comments || []);
  const [newComment, setNewComment] = useState('');
  
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [newAttrType, setNewAttrType] = useState<Attribute['type']>('text');
  const [newAttrOptions, setNewAttrOptions] = useState('');
  
  // Debounce timer for auto-save
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessful, setSaveSuccessful] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Refs to store previous values
  const prevValuesRef = useRef({
    title: task?.title || '',
    description: task?.description || '',
    startDate: startDate,
    startTime: startTime,
    endDate: endDate,
    endTime: endTime,
    color: color,
    attributes: attributes,
    comments: comments
  });
  
  // Function to check if task data has actually changed
  const hasTaskChanged = useCallback(() => {
    const prev = prevValuesRef.current;
    
    // Check if any field has changed
    return (
      title !== prev.title ||
      description !== prev.description ||
      startDate !== prev.startDate ||
      startTime !== prev.startTime ||
      endDate !== prev.endDate ||
      endTime !== prev.endTime ||
      color !== prev.color ||
      JSON.stringify(attributes) !== JSON.stringify(prev.attributes) ||
      JSON.stringify(comments) !== JSON.stringify(prev.comments)
    );
  }, [title, description, startDate, startTime, endDate, endTime, color, attributes, comments]);
  
  // Handle field change and mark as dirty
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    // Update the appropriate state based on field name
    switch (fieldName) {
      case 'title':
        setTitle(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'startDate':
        setStartDate(value);
        break;
      case 'startTime':
        setStartTime(value);
        break;
      case 'endDate':
        setEndDate(value);
        break;
      case 'endTime':
        setEndTime(value);
        break;
      case 'color':
        setColor(value);
        break;
    }
    
    // Mark as dirty - will trigger auto-save after debounce
    setIsDirty(true);
  }, []);
  
  // Auto-save function with debounce
  const autoSave = useCallback(() => {
    // Skip if not dirty or title is empty
    if (!isDirty || !title.trim() || !task?.id || isLoading) {
      return;
    }
    
    // Skip if no actual changes were made
    if (!hasTaskChanged()) {
      setIsDirty(false);
      return;
    }
    
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set a new timeout for the save operation
    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      
      const startDateTime = createDateTimeString(new Date(startDate), startTime);
      const endDateTime = createDateTimeString(new Date(endDate), endTime);
      
      const taskData = {
        title,
        description,
        startTime: startDateTime,
        endTime: endDateTime,
        color,
        comments: comments,
        attributes,
        id: task.id,
        status: task.status
      };
      
      // Update refs to current values for future comparison
      prevValuesRef.current = {
        title,
        description,
        startDate,
        startTime,
        endDate,
        endTime,
        color,
        attributes,
        comments
      };
      
      // Call onSubmit but don't allow it to close the modal
      onSubmit(taskData);
      
      // Show save success indicator briefly
      setSaveSuccessful(true);
      setTimeout(() => {
        setSaveSuccessful(false);
        setIsSaving(false);
        setIsDirty(false); // Reset dirty flag after successful save
      }, 1500);
    }, 2000); // 2-second debounce to avoid excessive saves
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    isDirty, 
    title, 
    task, 
    isLoading, 
    hasTaskChanged, 
    startDate, 
    startTime, 
    endDate, 
    endTime, 
    description, 
    color, 
    comments, 
    attributes, 
    onSubmit
  ]);
  
  // Call autoSave when isDirty changes
  useEffect(() => {
    if (isDirty) {
      autoSave();
    }
  }, [isDirty, autoSave]);
  
  // Update state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStartDate(new Date(task.startTime).toISOString().split('T')[0]);
      setStartTime(`${new Date(task.startTime).getHours().toString().padStart(2, '0')}:${new Date(task.startTime).getMinutes().toString().padStart(2, '0')}`);
      setEndDate(new Date(task.endTime).toISOString().split('T')[0]);
      setEndTime(`${new Date(task.endTime).getHours().toString().padStart(2, '0')}:${new Date(task.endTime).getMinutes().toString().padStart(2, '0')}`);
      setColor(task.color || 'bg-blue-200 border-blue-600');
      setAttributes(task.attributes || []);
      setComments(task.comments || []);
      
      // Update ref values when task changes
      prevValuesRef.current = {
        title: task.title,
        description: task.description || '',
        startDate: new Date(task.startTime).toISOString().split('T')[0],
        startTime: `${new Date(task.startTime).getHours().toString().padStart(2, '0')}:${new Date(task.startTime).getMinutes().toString().padStart(2, '0')}`,
        endDate: new Date(task.endTime).toISOString().split('T')[0],
        endTime: `${new Date(task.endTime).getHours().toString().padStart(2, '0')}:${new Date(task.endTime).getMinutes().toString().padStart(2, '0')}`,
        color: task.color || 'bg-blue-200 border-blue-600',
        attributes: task.attributes || [],
        comments: task.comments || []
      };
      
      // Reset dirty flag when loading a new task
      setIsDirty(false);
    }
  }, [task]);
  
  // Handler for form submission (only needed for new tasks now)
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const startDateTime = createDateTimeString(new Date(startDate), startTime);
    const endDateTime = createDateTimeString(new Date(endDate), endTime);
    
    const taskData = {
      title,
      description,
      startTime: startDateTime,
      endTime: endDateTime,
      color,
      comments: comments,
      attributes
    };
    
    if (!task?.id) {
      // For new tasks, we submit and close
      onSubmit(taskData);
      onClose();
    }
  };
  
  // Attribute management
  const addAttribute = () => {
    if (!newAttrName.trim() || !newAttrValue.trim()) return;
    
    const attribute: Attribute = {
      id: `attr-${Date.now()}`,
      name: newAttrName,
      value: newAttrValue,
      type: newAttrType,
      options: newAttrType === 'select' ? newAttrOptions.split(',').map(opt => opt.trim()) : undefined
    };
    
    const newAttributes = [...attributes, attribute];
    setAttributes(newAttributes);
    setNewAttrName('');
    setNewAttrValue('');
    setNewAttrOptions('');
    setIsDirty(true); // Mark as dirty when attributes change
  };
  
  const updateAttribute = (id: string, value: string) => {
    const newAttributes = attributes.map(attr => 
      attr.id === id ? { ...attr, value } : attr
    );
    setAttributes(newAttributes);
    setIsDirty(true); // Mark as dirty when attributes change
  };
  
  const deleteAttribute = (id: string) => {
    const newAttributes = attributes.filter(attr => attr.id !== id);
    setAttributes(newAttributes);
    setIsDirty(true); // Mark as dirty when attributes change
  };
  
  // Comment management - keeping the function but hiding UI
  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      content: newComment,
      author: 'User',
      createdAt: new Date()
    };
    
    const newComments = [...comments, comment];
    setComments(newComments);
    setNewComment('');
    setIsDirty(true); // Mark as dirty when comments change
  };
  
  // Color options for task
  const colorOptions = [
    { name: 'Blue', class: 'bg-blue-200 border-blue-600' },
    { name: 'Green', class: 'bg-green-200 border-green-600' },
    { name: 'Red', class: 'bg-red-200 border-red-600' },
    { name: 'Yellow', class: 'bg-yellow-200 border-yellow-600' },
    { name: 'Purple', class: 'bg-purple-200 border-purple-600' },
    { name: 'Pink', class: 'bg-pink-200 border-pink-600' },
    { name: 'Indigo', class: 'bg-indigo-200 border-indigo-600' },
    { name: 'Gray', class: 'bg-gray-200 border-gray-600' }
  ];
  
  const modalTitle = task?.id ? 'Edit Task' : 'Add New Task';
  const submitButtonText = task?.id ? 'Update Task' : 'Add Task';
  
  // Common input styles
  const inputStyle = "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-md text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200";
  const labelStyle = "block text-gray-700 font-medium mb-1.5";
  const buttonStyle = {
    base: "px-4 py-2.5 rounded-lg font-medium shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
  };

  console.log(attributes)
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          {/* Background overlay with blur */}
          <motion.div 
            className="fixed inset-0 backdrop-blur-sm bg-gray-700/60 transition-opacity"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
            onClick={onClose}
            style={{ zIndex: 40 }}
          />
          
          {/* Modal position helper */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          
          {/* Modal panel */}
          <motion.div 
            className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.25
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 50, position: 'relative' }}
          >
            {/* Header with colored background */}
            <div className={cn(
              'px-6 py-4 flex justify-between items-center border-b',
              color?.split(' ')[0] || 'bg-gray-50'
            )}>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                  {modalTitle}
                </h2>
                {isSaving && (
                  <div className="flex items-center text-sm text-blue-500">
                    <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </div>
                )}
                {saveSuccessful && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-green-500 flex items-center"
                  >
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Saved</span>
                  </motion.div>
                )}
                {isDirty && !isSaving && !saveSuccessful && (
                  <div className="text-sm text-amber-500 flex items-center">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V7a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3h6a3 3 0 003-3z" />
                    </svg>
                    <span>Unsaved changes</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {task?.id && onDelete && (
                  <motion.button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this task?")) {
                        onDelete(task.id);
                        onClose();
                      }
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-colors duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={isLoading}
                    aria-label="Delete task"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </motion.button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded-full p-1 transition-colors duration-200"
                  disabled={isLoading}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-[calc(85vh-8rem)] overflow-y-auto bg-gray-50">
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-6">
                  {/* Title */}
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <label className={labelStyle} htmlFor="title">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => handleFieldChange('title', e.target.value)}
                      className={cn(inputStyle, "text-lg font-medium")}
                      required
                      disabled={isLoading}
                      placeholder="Task title"
                    />
                  </div>
                  
                  {/* Description */}
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <label className={labelStyle} htmlFor="description">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      className={cn(inputStyle, "min-h-[100px] resize-y")}
                      rows={4}
                      disabled={isLoading}
                      placeholder="Task description"
                    />
                  </div>
                  
                  {/* Date and Time */}
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-4">Time Period</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className={labelStyle} htmlFor="startDate">
                          Start Date
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          value={startDate}
                          onChange={(e) => handleFieldChange('startDate', e.target.value)}
                          className={inputStyle}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div>
                        <label className={labelStyle} htmlFor="startTime">
                          Start Time
                        </label>
                        <input
                          type="time"
                          id="startTime"
                          value={startTime}
                          onChange={(e) => handleFieldChange('startTime', e.target.value)}
                          className={inputStyle}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelStyle} htmlFor="endDate">
                          End Date
                        </label>
                        <input
                          type="date"
                          id="endDate"
                          value={endDate}
                          onChange={(e) => handleFieldChange('endDate', e.target.value)}
                          className={inputStyle}
                          required
                          disabled={isLoading}
                        />
                      </div>
                      
                      <div>
                        <label className={labelStyle} htmlFor="endTime">
                          End Time
                        </label>
                        <input
                          type="time"
                          id="endTime"
                          value={endTime}
                          onChange={(e) => handleFieldChange('endTime', e.target.value)}
                          className={inputStyle}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Color selection */}
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <label className={labelStyle}>
                      Color
                    </label>
                    <div className="flex flex-wrap gap-4 mt-2">
                      {colorOptions.map((option, index) => (
                        <motion.button
                          key={index}
                          type="button"
                          onClick={() => handleFieldChange('color', option.class)}
                          className={cn(
                            "w-12 h-12 rounded-full shadow-sm",
                            option.class.split(' ')[0], // Using the background color only
                            color === option.class ? "ring-2 ring-offset-2 ring-blue-600 scale-110" : "ring-1 ring-gray-200"
                          )}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          disabled={isLoading}
                          title={option.name}
                          aria-label={`Select ${option.name} color`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Attributes Section */}
                  <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-4">Attributes</h3>
                    
                    {/* Existing attributes */}
                    {attributes.length > 0 && (
                      <div className="space-y-3 mb-5">
                        {attributes.map((attr) => (
                          <div key={attr.id + Math.random()} className="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex-1 mr-3">
                              <label className="block text-gray-700 text-sm font-medium mb-1">
                                {attr.name}
                              </label>
                              {attr.type === 'select' && attr.options ? (
                                <select
                                  value={attr.value}
                                  onChange={(e) => updateAttribute(attr.id, e.target.value)}
                                  className={inputStyle}
                                  disabled={isLoading}
                                >
                                  {attr.options.map((option, index) => (
                                    <option key={index} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </select>
                              ) : attr.type === 'number' ? (
                                <input
                                  type="number"
                                  value={attr.value}
                                  onChange={(e) => updateAttribute(attr.id, e.target.value)}
                                  className={inputStyle}
                                  disabled={isLoading}
                                />
                              ) : attr.type === 'date' ? (
                                <input
                                  type="date"
                                  value={attr.value}
                                  onChange={(e) => updateAttribute(attr.id, e.target.value)}
                                  className={inputStyle}
                                  disabled={isLoading}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={attr.value}
                                  onChange={(e) => updateAttribute(attr.id, e.target.value)}
                                  className={inputStyle}
                                  disabled={isLoading}
                                />
                              )}
                            </div>
                            <motion.button
                              type="button"
                              onClick={() => deleteAttribute(attr.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              disabled={isLoading}
                              aria-label="Delete attribute"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add new attribute */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                      <h4 className="font-medium text-sm text-gray-700 mb-3">Add New Attribute</h4>
                      <div className="space-y-3">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Attribute Name"
                            value={newAttrName}
                            onChange={(e) => setNewAttrName(e.target.value)}
                            className={inputStyle}
                            disabled={isLoading}
                          />
                          <select
                            value={newAttrType}
                            onChange={(e) => setNewAttrType(e.target.value as Attribute['type'])}
                            className={inputStyle}
                            disabled={isLoading}
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="date">Date</option>
                            <option value="select">Select</option>
                          </select>
                        </div>
                        
                        {newAttrType === 'select' && (
                          <div>
                            <input
                              type="text"
                              placeholder="Options (comma separated)"
                              value={newAttrOptions}
                              onChange={(e) => setNewAttrOptions(e.target.value)}
                              className={inputStyle}
                              disabled={isLoading}
                            />
                          </div>
                        )}
                        
                        <div className="flex space-x-2">
                          <input
                            type={newAttrType === 'number' ? 'number' : newAttrType === 'date' ? 'date' : 'text'}
                            placeholder="Attribute Value"
                            value={newAttrValue}
                            onChange={(e) => setNewAttrValue(e.target.value)}
                            className={inputStyle}
                            disabled={isLoading}
                          />
                          <motion.button
                            type="button"
                            onClick={addAttribute}
                            className={cn(buttonStyle.base, buttonStyle.success)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isLoading || !newAttrName.trim() || !newAttrValue.trim()}
                          >
                            Add
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Footer with action buttons - only show Save button for new tasks */}
                <div className="flex justify-end space-x-3 border-t border-gray-200 pt-5 mt-8 px-6 pb-6">
                  {/* Save button for existing tasks with unsaved changes */}
                  {task?.id && isDirty && (
                    <motion.button
                      type="button"
                      onClick={autoSave}
                      className={cn(buttonStyle.base, buttonStyle.primary)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading || !hasTaskChanged()}
                    >
                      Save Changes
                    </motion.button>
                  )}
                  
                  {/* Only show save button for new tasks */}
                  {!task?.id && (
                    <motion.button
                      type="submit"
                      onClick={handleSubmit}
                      className={cn(buttonStyle.base, buttonStyle.primary)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </div>
                      ) : submitButtonText}
                    </motion.button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default TaskModal; 