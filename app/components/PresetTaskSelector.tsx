import React, { memo } from 'react';
import { Task } from '../types';
import { formatTime } from '../utils/dateUtils';
import { cn } from '../utils/cn';

interface PresetTaskWithId extends Omit<Task, 'id' | 'status'> {
  id: string;
}

interface PresetTaskSelectorProps {
  presets: PresetTaskWithId[];
  onSelect: (preset: Omit<Task, 'id' | 'status'>) => void;
  onCreate: (task: Omit<Task, 'id' | 'status'>) => void;
  onCancel: () => void;
}

const PresetTaskSelector: React.FC<PresetTaskSelectorProps> = ({ 
  presets, 
  onSelect, 
  onCreate,
  onCancel 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Select a Template</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presets.map(preset => (
          <div 
            key={preset.id}
            className={cn(
              "p-4 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition-shadow",
              preset.color || "border-blue-500 bg-blue-50"
            )}
            onClick={() => {
              const { id, ...rest } = preset;
              onSelect(rest);
            }}
          >
            <h3 className="font-semibold text-gray-800">{preset.title}</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{preset.description}</p>
            
            {preset.attributes && preset.attributes.length > 0 && (
              <div className="mt-3 text-xs text-gray-600">
                <span className="font-medium">Attributes:</span> {preset.attributes.length}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(PresetTaskSelector); 