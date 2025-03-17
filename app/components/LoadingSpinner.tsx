'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function LoadingSpinner() {
  const [delayComplete, setDelayComplete] = useState(false);
  
  // Short delay before showing loading spinner to avoid flash for quick loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayComplete(true);
    }, 150); // Only show spinner if loading takes more than 150ms
    
    return () => clearTimeout(timer);
  }, []);
  
  // Don't render anything if we haven't hit the delay threshold
  if (!delayComplete) {
    return null;
  }
  
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { 
        duration: 0.15,
        staggerChildren: 0.08
      }
    }
  };

  const circleVariants = {
    initial: { scale: 0.8, opacity: 0.5 },
    animate: { 
      scale: 1,
      opacity: 1,
      transition: {
        type: "tween" as const,
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut"
      }
    }
  };

  const textVariant = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 0.7, 
      transition: {
        delay: 0.2,
        duration: 0.2
      }
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <div className="p-6 rounded-lg flex flex-col items-center">
        <motion.div 
          className="flex space-x-2"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <motion.div
            className="w-2 h-2 bg-blue-600 rounded-full"
            variants={circleVariants}
            custom={0}
          />
          <motion.div
            className="w-2 h-2 bg-blue-500 rounded-full"
            variants={circleVariants}
            custom={1}
          />
          <motion.div
            className="w-2 h-2 bg-blue-400 rounded-full"
            variants={circleVariants}
            custom={2}
          />
        </motion.div>
      </div>
    </div>
  );
} 