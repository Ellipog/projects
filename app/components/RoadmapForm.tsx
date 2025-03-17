'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

type ColorOption = {
  name: string;
  value: string;
  textColor: string;
};

const colorOptions: ColorOption[] = [
  { name: 'Blue', value: '#3b82f6', textColor: 'text-white' },
  { name: 'Green', value: '#10b981', textColor: 'text-white' },
  { name: 'Red', value: '#ef4444', textColor: 'text-white' },
  { name: 'Purple', value: '#8b5cf6', textColor: 'text-white' },
  { name: 'Yellow', value: '#f59e0b', textColor: 'text-black' },
  { name: 'Indigo', value: '#6366f1', textColor: 'text-white' },
  { name: 'Pink', value: '#ec4899', textColor: 'text-white' },
  { name: 'Gray', value: '#6b7280', textColor: 'text-white' },
];

export default function RoadmapForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: colorOptions[0].value,
    isPublic: false,
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleColorChange = (colorValue: string) => {
    setFormData(prev => ({ ...prev, color: colorValue }));
  };
  
  const handleTogglePublic = () => {
    setFormData(prev => ({ ...prev, isPublic: !prev.isPublic }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    // Initialize roadmap structure
    const newRoadmap = {
      title: formData.title,
      description: formData.description,
      color: formData.color,
      isPublic: formData.isPublic,
      columns: {
        'column-1': {
          id: 'column-1',
          title: 'To Do',
          taskIds: []
        },
        'column-2': {
          id: 'column-2',
          title: 'In Progress',
          taskIds: []
        },
        'column-3': {
          id: 'column-3',
          title: 'Done',
          taskIds: []
        }
      },
      columnOrder: ['column-1', 'column-2', 'column-3'],
      user: user?._id
    };
    
    try {
      const response = await fetch('/api/roadmaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRoadmap)
      });
      
      const data = await response.json();
      
      if (data.success) {
        router.push(`/roadmaps/${data.data.slug}`);
      } else {
        setError('Failed to create new project');
      }
    } catch (err) {
      setError('Error creating project');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const formItem = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.03,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.97 },
    disabled: { 
      opacity: 0.7,
      cursor: "not-allowed",
      scale: 1
    }
  };
  
  const colorButtonVariants = {
    selected: { 
      scale: 1.2,
      boxShadow: "0 0 0 2px white, 0 0 0 4px #3b82f6",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17
      }
    },
    unselected: { 
      scale: 1,
      boxShadow: "none"
    },
    hover: { 
      scale: 1.15,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 17
      }
    }
  };
  
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-6 max-w-xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
    >
      <motion.h2 
        className="text-2xl font-bold text-gray-900 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Create New Project
      </motion.h2>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            className="bg-red-50 text-red-800 p-4 rounded-md mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        variants={formContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div className="space-y-2" variants={formItem}>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <motion.input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="My Awesome Project"
            required
            whileFocus={{ 
              boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" 
            }}
          />
        </motion.div>
        
        <motion.div className="space-y-2" variants={formItem}>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <motion.textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Project description (optional)"
            whileFocus={{ 
              boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.3)" 
            }}
          />
        </motion.div>
        
        <motion.div className="space-y-2" variants={formItem}>
          <label className="block text-sm font-medium text-gray-700">
            Theme Color
          </label>
          <motion.div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <motion.button
                key={color.value}
                type="button"
                onClick={() => handleColorChange(color.value)}
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: color.value }}
                title={color.name}
                variants={colorButtonVariants}
                initial="unselected"
                animate={formData.color === color.value ? "selected" : "unselected"}
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              />
            ))}
          </motion.div>
        </motion.div>
        
        <motion.div className="flex items-center" variants={formItem}>
          <motion.input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleTogglePublic}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
            Make this project public (anyone with the link can view)
          </label>
        </motion.div>
        
        <motion.div 
          className="flex justify-end space-x-4 pt-4"
          variants={formItem}
        >
          <motion.button
            type="button"
            onClick={() => router.push('/roadmaps')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            variants={buttonVariants}
            initial="initial"
            whileHover={isSubmitting ? "disabled" : "hover"}
            whileTap={isSubmitting ? "disabled" : "tap"}
            animate={isSubmitting ? "disabled" : "initial"}
          >
            {isSubmitting ? (
              <motion.div className="flex items-center">
                <motion.span 
                  className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1,
                    ease: "linear" 
                  }}
                />
                Creating...
              </motion.div>
            ) : "Create Project"}
          </motion.button>
        </motion.div>
      </motion.form>
    </motion.div>
  );
} 