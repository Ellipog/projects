'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Roadmap from '../../components/Roadmap';
import { hasPermission } from '../../utils/permissions';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';

interface PageProps {
  params: {
    slug: string;
  };
}

export default function RoadmapPage({ params }: PageProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [roadmap, setRoadmap] = useState<any>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionLevel, setPermissionLevel] = useState<string | null>(null);
  const [slug] = useState<string>(params.slug);
  
  // Fetch roadmap data
  useEffect(() => {
    if (loading) return;

    const fetchRoadmap = async () => {
      try {
        setRoadmapLoading(true);
        const response = await fetch(`/api/roadmaps/slug/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Project not found');
          } else if (response.status === 403) {
            setError('You do not have permission to view this project');
          } else {
            setError('Failed to load project');
          }
          return;
        }
        
        const data = await response.json();
        
        if (data.success) {
          const roadmapData = data.data;
          setRoadmap(roadmapData);
          
          // Check permissions
          // If user is not logged in and roadmap is not public
          if (!user && !roadmapData.isPublic) {
            setError('You need to sign in to view this project');
            return;
          }
          
          // Determine permission level for editing controls
          if (user && roadmapData.user.toString() === user._id) {
            setPermissionLevel('admin');
          } else if (user) {
            const sharedWith = roadmapData.sharedWith.find(
              (share: any) => share.email === user.email
            );
            if (sharedWith) {
              setPermissionLevel(sharedWith.permissionLevel);
            } else if (roadmapData.isPublic) {
              setPermissionLevel('view');
            } else {
              setError('You do not have permission to view this project');
            }
          } else if (roadmapData.isPublic) {
            setPermissionLevel('view');
          }
        } else {
          setError(data.message || 'Failed to load project');
        }
      } catch (err) {
        setError('Error loading project data');
        console.error(err);
      } finally {
        setRoadmapLoading(false);
      }
    };
    
    fetchRoadmap();
  }, [slug, user, loading, router]);
  
  // Handle share roadmap
  const handleShare = () => {
    // Implement sharing modal here
    alert('Sharing feature will be implemented here');
  };
  
  // Toggle public visibility
  const togglePublic = async () => {
    try {
      const response = await fetch(`/api/roadmaps/${roadmap._id}/visibility`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPublic: !roadmap.isPublic })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRoadmap(data.data);
      } else {
        setError('Failed to update visibility');
      }
    } catch (err) {
      setError('Error updating project visibility');
      console.error(err);
    }
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

  const badgeVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.2
      }
    }
  };
  
  if (loading || roadmapLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <div className="min-h-screen">
        <motion.div 
          className="container mx-auto p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="bg-red-50 text-red-800 p-8 rounded-md mb-6 text-center"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.h2 
              className="text-2xl font-bold mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              Error
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {error}
            </motion.p>
            <motion.button 
              onClick={() => router.push('/roadmaps')}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              transition={{ delay: 0.3, duration: 0.2 }}
            >
              Back to Projects
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }
  
  if (!roadmap) {
    return (
      <div className="min-h-screen">
        <motion.div 
          className="container mx-auto p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="flex justify-center items-center h-64"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-gray-500">Project not found</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }
  
  const canEdit = permissionLevel === 'admin' || permissionLevel === 'edit';
  
  return (
    <div className="h-full">
      <motion.div 
        className="h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="flex justify-between items-center mb-6"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <h1 className="text-2xl font-bold text-gray-900">{roadmap.title}</h1>
            {roadmap.description && (
              <p className="text-gray-600 mt-1">{roadmap.description}</p>
            )}
          </motion.div>
          
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {/* Only show admin controls for owners */}
            {permissionLevel === 'admin' && (
              <AnimatePresence>
                <motion.button
                  onClick={togglePublic}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    roadmap.isPublic 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  {roadmap.isPublic ? 'Public' : 'Private'}
                </motion.button>
                
                <motion.button
                  onClick={handleShare}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  Share
                </motion.button>
              </AnimatePresence>
            )}
             
            <motion.button
              onClick={() => router.push('/roadmaps')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
            >
              Back
            </motion.button>
          </motion.div>
        </motion.div>
        
        {/* Public badge for non-owners */}
        {permissionLevel !== 'admin' && roadmap.isPublic && (
          <motion.div 
            className="mb-4 inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
            variants={badgeVariants}
            initial="initial"
            animate="animate"
          >
            Public Project
          </motion.div>
        )}
        
        {/* Shared with you badge for non-owners */}
        {permissionLevel !== 'admin' && !roadmap.isPublic && (
          <motion.div 
            className="mb-4 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            variants={badgeVariants}
            initial="initial"
            animate="animate"
          >
            Shared with you ({permissionLevel})
          </motion.div>
        )}
        
        {/* Pass the roadmap data and edit permissions to the Roadmap component */}
        <Roadmap 
          initialData={roadmap} 
          canEdit={canEdit}
        />
      </motion.div>
    </div>
  );
}