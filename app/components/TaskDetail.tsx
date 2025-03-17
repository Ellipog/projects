import React, { useState, FormEvent, useEffect } from 'react';
import { Task, Comment, Attribute } from '../types';
import { formatDateTime } from '../utils/dateUtils';
import { cn } from '../utils/cn';
import { motion } from 'framer-motion';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ 
  task, 
  onClose, 
  onSave, 
  onDelete,
  isLoading = false,
  readOnly = false
}) => {
  // State for editable fields
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [startTime, setStartTime] = useState(
    new Date(task.startTime).toISOString().slice(0, 16)
  );
  const [endTime, setEndTime] = useState(
    new Date(task.endTime).toISOString().slice(0, 16)
  );
  const [color, setColor] = useState(task.color || '');
  const [attributes, setAttributes] = useState<Attribute[]>([...task.attributes]);
  const [comments, setComments] = useState<Comment[]>([...task.comments]);
  const [newComment, setNewComment] = useState('');
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [newAttrType, setNewAttrType] = useState<Attribute['type']>('text');
  const [newAttrOptions, setNewAttrOptions] = useState('');
  const [editableFields, setEditableFields] = useState<Record<string, boolean>>({
    title: false,
    description: false,
    dates: false,
    color: false
  });
  const [isSaving, setIsSaving] = useState(false);

  // Update state when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setStartTime(new Date(task.startTime).toISOString().slice(0, 16));
    setEndTime(new Date(task.endTime).toISOString().slice(0, 16));
    setColor(task.color || '');
    setAttributes([...task.attributes]);
    setComments([...task.comments]);
  }, [task]);

  const handleSave = async () => {
    if (isLoading || isSaving || readOnly) return;
    
    setIsSaving(true);

    try {
      const updatedTask: Task = {
        ...task,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        color, // Ensure color is included in the update
        attributes,
        comments
      };

      await onSave(updatedTask);
      
      // Reset all editable fields to view mode
      setEditableFields({
        title: false,
        description: false,
        dates: false,
        color: false,
      });
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEditField = (field: string) => {
    if (readOnly) return;
    setEditableFields({
      ...editableFields,
      [field]: !editableFields[field]
    });
  };

  const addComment = () => {
    if (!newComment.trim() || isLoading || readOnly) return;
    
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      content: newComment,
      author: 'Current User', // This would normally come from authentication
      createdAt: new Date()
    };
    
    setComments([...comments, comment]);
    setNewComment('');
    
    // Auto-save when adding comments
    handleSave();
  };

  const addAttribute = () => {
    if (!newAttrName.trim() || !newAttrValue.trim() || isLoading || readOnly) return;
    
    const attribute: Attribute = {
      id: `attr-${Date.now()}`,
      name: newAttrName,
      value: newAttrValue,
      type: newAttrType,
      options: newAttrType === 'select' ? newAttrOptions.split(',').map(opt => opt.trim()) : undefined
    };
    
    setAttributes([...attributes, attribute]);
    setNewAttrName('');
    setNewAttrValue('');
    setNewAttrOptions('');
    
    // Auto-save when adding attributes
    handleSave();
  };

  const updateAttribute = (id: string, value: string) => {
    if (isLoading || readOnly) return;
    
    setAttributes(
      attributes.map(attr => 
        attr.id === id ? { ...attr, value } : attr
      )
    );
    
    // Auto-save when updating attributes
    handleSave();
  };

  const deleteAttribute = (id: string) => {
    if (isLoading || readOnly) return;
    
    setAttributes(attributes.filter(attr => attr.id !== id));
    
    // Auto-save when deleting attributes
    handleSave();
  };

  const colorOptions = [
    { class: 'bg-blue-100 border-blue-500', name: 'Blue' },
    { class: 'bg-green-100 border-green-500', name: 'Green' },
    { class: 'bg-purple-100 border-purple-500', name: 'Purple' },
    { class: 'bg-yellow-100 border-yellow-500', name: 'Yellow' },
    { class: 'bg-red-100 border-red-500', name: 'Red' },
    { class: 'bg-indigo-100 border-indigo-500', name: 'Indigo' },
    { class: 'bg-pink-100 border-pink-500', name: 'Pink' },
    { class: 'bg-gray-100 border-gray-500', name: 'Gray' },
  ];

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.98 }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className={cn(
        'px-6 py-4 flex justify-between items-center border-b',
        task.color?.split(' ')[0] || 'bg-gray-50'
      )}>
        <div className="flex-1">
          {editableFields.title ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full font-bold text-xl border-b border-blue-500 focus:outline-none px-1"
              onBlur={() => toggleEditField('title')}
              onKeyDown={(e) => e.key === 'Enter' && toggleEditField('title') && handleSave()}
              autoFocus
              disabled={isLoading}
            />
          ) : (
            <h2 
              className="text-xl font-bold text-gray-800 cursor-pointer px-1 hover:bg-gray-100 rounded"
              onClick={() => !readOnly && toggleEditField('title')}
            >
              {title}
              {!readOnly && (
                <span className="ml-2 text-xs text-gray-500 opacity-50 hover:opacity-100">
                  ✏️
                </span>
              )}
            </h2>
          )}
        </div>
        
        <div className="flex space-x-2">
          {!readOnly && (
            <>
              <motion.button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm shadow-sm"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                disabled={isLoading}
              >
                Save
              </motion.button>
              <motion.button
                onClick={() => onDelete(task.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm shadow-sm"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                disabled={isLoading}
              >
                Delete
              </motion.button>
            </>
          )}
          <motion.button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md text-sm shadow-sm"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={isLoading}
          >
            Close
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description Section */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold text-gray-700">Description</h3>
            {!readOnly && (
              <button 
                onClick={() => toggleEditField('description')}
                className="text-blue-600 text-sm"
                disabled={isLoading}
              >
                {editableFields.description ? 'Done' : 'Edit'}
              </button>
            )}
          </div>
          
          {editableFields.description ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={4}
              disabled={isLoading}
              onBlur={() => handleSave()}
            />
          ) : (
            <div 
              className={cn(
                "bg-gray-50 rounded-lg p-3 text-gray-700 min-h-[100px]",
                !readOnly && "hover:bg-gray-100 cursor-pointer"
              )}
              onClick={() => !readOnly && toggleEditField('description')}
            >
              {description || <span className="text-gray-400 italic">No description provided</span>}
            </div>
          )}
        </div>

        {/* Time Section */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold text-gray-700">Time</h3>
            {!readOnly && (
              <button 
                onClick={() => toggleEditField('dates')}
                className="text-blue-600 text-sm"
                disabled={isLoading}
              >
                {editableFields.dates ? 'Done' : 'Edit'}
              </button>
            )}
          </div>
          
          {editableFields.dates ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm mb-1">End Time</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  disabled={isLoading}
                  onBlur={() => handleSave()}
                />
              </div>
            </div>
          ) : (
            <div 
              className={cn(
                "bg-gray-50 rounded-lg p-3 text-gray-700",
                !readOnly && "hover:bg-gray-100 cursor-pointer"
              )}
              onClick={() => !readOnly && toggleEditField('dates')}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <div className="mb-2 sm:mb-0">
                  <span className="text-gray-500 text-sm">Start:</span> {formatDateTime(task.startTime)}
                </div>
                <div>
                  <span className="text-gray-500 text-sm">End:</span> {formatDateTime(task.endTime)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Color Section */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold text-gray-700">Color</h3>
            {!readOnly && (
              <button 
                onClick={() => toggleEditField('color')}
                className="text-blue-600 text-sm"
                disabled={isLoading}
              >
                {editableFields.color ? 'Done' : 'Edit'}
              </button>
            )}
          </div>
          
          {editableFields.color ? (
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((option, index) => (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => {
                    setColor(option.class);
                    toggleEditField('color');
                    handleSave();
                  }}
                  className={cn(
                    "w-8 h-8 rounded-full border-2",
                    option.class,
                    color === option.class ? "ring-2 ring-offset-2 ring-blue-500" : ""
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={isLoading}
                  title={option.name}
                />
              ))}
            </div>
          ) : (
            <div 
              className={cn(
                "flex items-center space-x-2",
                !readOnly && "cursor-pointer"
              )}
              onClick={() => !readOnly && toggleEditField('color')}
            >
              <div className={cn(
                "w-6 h-6 rounded-full border",
                color || "bg-gray-200 border-gray-300"
              )} />
              <span className="text-gray-700">
                {color ? colorOptions.find(opt => opt.class === color)?.name || 'Custom' : 'Default'}
              </span>
            </div>
          )}
        </div>
        
        {/* Attributes Section */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">Attributes</h3>
          
          {attributes.length > 0 ? (
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <div className="space-y-2">
                {attributes.map(attr => (
                  <div key={attr.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">{attr.name}: </span>
                      <span className="text-gray-600">{attr.value}</span>
                    </div>
                    {!readOnly && (
                      <button
                        onClick={() => deleteAttribute(attr.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                        disabled={isLoading}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-3 text-gray-500 italic mb-3">
              No attributes defined
            </div>
          )}
          
          {!readOnly && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border rounded-lg">
              <input
                type="text"
                value={newAttrName}
                onChange={(e) => setNewAttrName(e.target.value)}
                placeholder="Name"
                className="shadow-sm border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                disabled={isLoading}
              />
              <input
                type="text"
                value={newAttrValue}
                onChange={(e) => setNewAttrValue(e.target.value)}
                placeholder="Value"
                className="shadow-sm border rounded py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                disabled={isLoading}
              />
              <button
                onClick={addAttribute}
                className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                disabled={!newAttrName.trim() || !newAttrValue.trim() || isLoading}
              >
                Add Attribute
              </button>
            </div>
          )}
        </div>
        
        {/* Comments Section */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Comments</h3>
          
          {comments.length > 0 ? (
            <div className="space-y-3 mb-4">
              {comments.map(comment => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-700">{comment.author}</span>
                    <span className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</span>
                  </div>
                  <p className="text-gray-600 mt-1">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-3 text-gray-500 italic mb-4">
              No comments yet
            </div>
          )}
          
          {!readOnly && (
            <div className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 shadow-sm border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                disabled={isLoading}
                onKeyDown={(e) => e.key === 'Enter' && addComment()}
              />
              <button
                onClick={addComment}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                disabled={!newComment.trim() || isLoading}
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail; 