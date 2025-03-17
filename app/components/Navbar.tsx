'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navAnimation = {
    hidden: { y: -10, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "tween",
        ease: "easeOut",
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  const linkItem = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: {
        duration: 0.2
      }
    },
    hover: {
      scale: 1.02,
      color: "#2563eb", // blue-600
      transition: {
        duration: 0.2
      }
    }
  };

  const logoVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.03,
      transition: {
        duration: 0.2
      }
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

  const mobileMenuVariants = {
    hidden: { 
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    visible: { 
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeOut",
        staggerChildren: 0.05
      }
    }
  };

  const mobileMenuItemVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: 0.2
      }
    }
  };
  
  return (
    <motion.nav 
      className="bg-white border-b border-gray-200 px-4 py-2.5 fixed w-full top-0 left-0 z-50"
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{
        type: "tween",
        ease: "easeOut",
        duration: 0.3
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <motion.span 
              className="self-center text-xl font-semibold whitespace-nowrap text-blue-600"
              variants={logoVariants}
              initial="initial"
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
            >
              PROJECTS
            </motion.span>
          </Link>
        </div>
        
        {/* Desktop menu */}
        <motion.div 
          className="hidden md:flex items-center"
          variants={navAnimation}
          initial="hidden"
          animate="show"
        >
          {user ? (
            <>
              <motion.div variants={linkItem}>
                <Link href="/roadmaps" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  <motion.span whileHover={linkItem.hover}>
                    My Projects
                  </motion.span>
                </Link>
              </motion.div>
              
              <motion.div 
                className="flex items-center ml-4 pl-4 border-l border-gray-200"
                variants={linkItem}
              >
                <motion.span 
                  className="text-sm text-gray-700 mr-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {user.username}
                </motion.span>
                <motion.button
                  onClick={handleLogout}
                  className="text-sm text-gray-700 hover:text-blue-600"
                  whileHover={linkItem.hover}
                  whileTap={{ scale: 0.98 }}
                >
                  Logout
                </motion.button>
              </motion.div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <motion.div variants={linkItem}>
                <Link
                  href="/login"
                  className="text-sm text-gray-700 hover:text-blue-600"
                >
                  <motion.span whileHover={linkItem.hover}>
                    Login
                  </motion.span>
                </Link>
              </motion.div>
              
              <motion.div variants={linkItem}>
                <Link href="/signup">
                  <motion.span
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-block"
                    variants={buttonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Sign Up
                  </motion.span>
                </Link>
              </motion.div>
            </div>
          )}
        </motion.div>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <motion.button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-700 hover:text-blue-600 focus:outline-none"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              animate={{ rotate: isMenuOpen ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </motion.svg>
          </motion.button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden px-2 pt-2 pb-3 space-y-1 overflow-hidden"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {user ? (
              <>
                <motion.div
                  variants={mobileMenuItemVariants}
                >
                  <Link 
                    href="/roadmaps"
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <motion.span 
                      whileHover={linkItem.hover}
                      className="inline-block"
                    >
                      My Projects
                    </motion.span>
                  </Link>
                </motion.div>
                
                <motion.div 
                  className="border-t border-gray-200 mt-2 pt-2"
                  variants={mobileMenuItemVariants}
                >
                  <span className="block px-3 py-2 text-sm text-gray-700">
                    Signed in as {user.username}
                  </span>
                  <motion.button
                    onClick={handleLogout}
                    className="block w-full text-left text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                    whileHover={linkItem.hover}
                  >
                    Logout
                  </motion.button>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  variants={mobileMenuItemVariants}
                >
                  <Link 
                    href="/login"
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <motion.span 
                      whileHover={linkItem.hover}
                      className="inline-block"
                    >
                      Login
                    </motion.span>
                  </Link>
                </motion.div>
                
                <motion.div
                  variants={mobileMenuItemVariants}
                >
                  <Link 
                    href="/signup"
                    className="block px-3 py-2 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <motion.span
                      className="inline-block text-gray-700 hover:text-blue-600 text-base font-medium"
                      whileHover={linkItem.hover}
                    >
                      Sign Up
                    </motion.span>
                  </Link>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
} 