import React, { useState, FormEvent } from 'react';
import { Task, Attribute } from '../types';
import { createDateTimeString } from '../utils/dateUtils';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'status'>) => void;
  initialTask?: Partial<Task>;
  onCancel: () => void;
  isTemplate?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  onSubmit, 
  initialTask = {}, 
  onCancel,
  isTemplate = false 
}) => {
  const [title, setTitle] = useState(initialTask.title || '');
  const [description, setDescription] = useState(initialTask.description || '');
  const [startDate, setStartDate] = useState(
    initialTask.startTime 
      ? new Date(initialTask.startTime).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(
    initialTask.startTime 
      ? `${new Date(initialTask.startTime).getHours().toString().padStart(2, '0')}:${new Date(initialTask.startTime).getMinutes().toString().padStart(2, '0')}` 
      : '09:00'
  );
  const [endDate, setEndDate] = useState(
    initialTask.endTime 
      ? new Date(initialTask.endTime).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );
  const [endTime, setEndTime] = useState(
    initialTask.endTime 
      ? `${new Date(initialTask.endTime).getHours().toString().padStart(2, '0')}:${new Date(initialTask.endTime).getMinutes().toString().padStart(2, '0')}` 
      : '17:00'
  );
  const [color, setColor] = useState(initialTask.color || 'bg-blue-100 border-blue-500');
  const [attributes, setAttributes] = useState<Attribute[]>(initialTask.attributes || []);
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');
  const [newAttrType, setNewAttrType] = useState<Attribute['type']>('text');
  const [newAttrOptions, setNewAttrOptions] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const startDateTime = createDateTimeString(new Date(startDate), startTime);
    const endDateTime = createDateTimeString(new Date(endDate), endTime);
    
    onSubmit({
      title,
      description,
      startTime: startDateTime,
      endTime: endDateTime,
      color,
      comments: initialTask.comments || [],
      attributes
    });
  };

  const addAttribute = () => {
    if (!newAttrName.trim() || !newAttrValue.trim()) return;
    
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
  };

  const updateAttribute = (id: string, value: string) => {
    setAttributes(
      attributes.map(attr => 
        attr.id === id ? { ...attr, value } : attr
      )
    );
  };

  const deleteAttribute = (id: string) => {
    setAttributes(attributes.filter(attr => attr.id !== id));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">
        {isTemplate ? 'Create Preset Template' : initialTask.id ? 'Edit Task' : 'Add New Task'}
      </h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startTime">
            Start Time
          </label>
          <input
            type="time"
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endTime">
            End Time
          </label>
          <input
            type="time"
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Color
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setColor('bg-blue-100 border-blue-500')}
            className={`w-8 h-8 rounded-full bg-blue-100 border-2 ${color === 'bg-blue-100 border-blue-500' ? 'border-blue-500 ring-2 ring-blue-300' : 'border-transparent'}`}
          />
          <button
            type="button"
            onClick={() => setColor('bg-green-100 border-green-500')}
            className={`w-8 h-8 rounded-full bg-green-100 border-2 ${color === 'bg-green-100 border-green-500' ? 'border-green-500 ring-2 ring-green-300' : 'border-transparent'}`}
          />
          <button
            type="button"
            onClick={() => setColor('bg-purple-100 border-purple-500')}
            className={`w-8 h-8 rounded-full bg-purple-100 border-2 ${color === 'bg-purple-100 border-purple-500' ? 'border-purple-500 ring-2 ring-purple-300' : 'border-transparent'}`}
          />
          <button
            type="button"
            onClick={() => setColor('bg-yellow-100 border-yellow-500')}
            className={`w-8 h-8 rounded-full bg-yellow-100 border-2 ${color === 'bg-yellow-100 border-yellow-500' ? 'border-yellow-500 ring-2 ring-yellow-300' : 'border-transparent'}`}
          />
          <button
            type="button"
            onClick={() => setColor('bg-red-100 border-red-500')}
            className={`w-8 h-8 rounded-full bg-red-100 border-2 ${color === 'bg-red-100 border-red-500' ? 'border-red-500 ring-2 ring-red-300' : 'border-transparent'}`}
          />
        </div>
      </div>

      {/* Attributes */}
      <div className="border-t border-gray-200 pt-4 mb-4">
        <h3 className="text-lg font-semibold mb-2">Attributes</h3>
        
        {/* Existing attributes */}
        {attributes.map((attr) => (
          <div key={attr.id} className="flex items-center mb-3">
            <div className="flex-1 mr-2">
              <label className="block text-gray-700 text-sm font-bold mb-1">
                {attr.name}
              </label>
              {attr.type === 'select' && attr.options ? (
                <select
                  value={attr.value}
                  onChange={(e) => updateAttribute(attr.id, e.target.value)}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700"
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
                  className="shadow border rounded w-full py-2 px-3 text-gray-700"
                />
              ) : attr.type === 'date' ? (
                <input
                  type="date"
                  value={attr.value}
                  onChange={(e) => updateAttribute(attr.id, e.target.value)}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700"
                />
              ) : (
                <input
                  type="text"
                  value={attr.value}
                  onChange={(e) => updateAttribute(attr.id, e.target.value)}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700"
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => deleteAttribute(attr.id)}
              className="bg-red-100 text-red-500 p-1 rounded-full hover:bg-red-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add new attribute */}
        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="text-sm font-medium mb-2">Add New Attribute</h4>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              placeholder="Attribute Name"
              value={newAttrName}
              onChange={(e) => setNewAttrName(e.target.value)}
              className="shadow border rounded py-2 px-3 text-gray-700 text-sm"
            />
            <select
              value={newAttrType}
              onChange={(e) => setNewAttrType(e.target.value as Attribute['type'])}
              className="shadow border rounded py-2 px-3 text-gray-700 text-sm"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="select">Select</option>
            </select>
          </div>
          
          {newAttrType === 'select' && (
            <div className="mb-2">
              <input
                type="text"
                placeholder="Options (comma separated)"
                value={newAttrOptions}
                onChange={(e) => setNewAttrOptions(e.target.value)}
                className="shadow border rounded w-full py-2 px-3 text-gray-700 text-sm"
              />
            </div>
          )}
          
          <div className="flex items-center">
            <input
              type={newAttrType === 'number' ? 'number' : newAttrType === 'date' ? 'date' : 'text'}
              placeholder="Attribute Value"
              value={newAttrValue}
              onChange={(e) => setNewAttrValue(e.target.value)}
              className="shadow border rounded flex-1 py-2 px-3 text-gray-700 text-sm mr-2"
            />
            <button
              type="button"
              onClick={addAttribute}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              Add
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          {isTemplate ? 'Create Template' : initialTask.id ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm; 