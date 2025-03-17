'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';

// Project card component
const RoadmapCard = ({ roadmap, index }: { roadmap: any, index: number }) => {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/roadmaps/${roadmap.slug}`);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    }),
    hover: { 
      y: -3, 
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: { scale: 0.98 }
  };

  const badgeVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.2
      }
    }
  };
  
  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer"
      onClick={handleClick}
      variants={cardVariants}
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      layoutId={`roadmap-card-${roadmap._id}`}
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {roadmap.title}
      </h3>
      {roadmap.description && (
        <p className="text-gray-600 mb-4">{roadmap.description}</p>
      )}
      <div className="flex items-center justify-between">
        <motion.span 
          className="text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          {new Date(roadmap.updatedAt).toLocaleDateString()}
        </motion.span>
        <div className="flex items-center">
          {roadmap.isPublic && (
            <motion.span 
              className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2"
              variants={badgeVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.15 }}
            >
              Public
            </motion.span>
          )}
          {roadmap.sharedWith?.length > 0 && (
            <motion.span 
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              variants={badgeVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
            >
              Shared
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function RoadmapsPage() {
  const { user, loading } = useAuth();
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Fetch user's roadmaps
  useEffect(() => {
    const fetchRoadmaps = async () => {
      if (!loading) {
        if (!user) {
          router.push('/login');
          return;
        }
        
        try {
          const response = await fetch(`/api/roadmaps?userId=${user._id}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch roadmaps');
          }
          
          const data = await response.json();
          setRoadmaps(data.data || []);
        } catch (err) {
          setError('Error loading roadmaps. Please try again later.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchRoadmaps();
  }, [user, loading, router]);
  
  const handleCreateNew = () => {
    router.push('/roadmaps/new');
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
      transition: {
        duration: 0.2
      }
    },
    tap: { scale: 0.98 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };
  
  if (loading || isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="min-h-screen">
      <motion.div 
        className="container mx-auto p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeOut"
          }}
        >
          <motion.h1 
            className="text-2xl font-bold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Your Projects
          </motion.h1>
          <motion.button
            onClick={handleCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Project
          </motion.button>
        </motion.div>
        
        <AnimatePresence>
          {error && (
            <motion.div 
              className="bg-red-50 text-red-800 p-4 rounded-md mb-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence mode="wait">
          {roadmaps.length === 0 ? (
            <motion.div 
              className="bg-white rounded-lg shadow-md p-8 text-center"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 mx-auto text-gray-400 mb-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </motion.svg>
              <motion.h2 
                className="text-xl font-semibold text-gray-700 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                No projects yet
              </motion.h2>
              <motion.p 
                className="text-gray-500 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                Create your first project to get started
              </motion.p>
              <motion.button
                onClick={handleCreateNew}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
              >
                Create New Project
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {roadmaps.map((roadmap, index) => (
                <RoadmapCard key={roadmap._id} roadmap={roadmap} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
} 