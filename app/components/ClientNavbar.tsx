'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled to prevent hydration issues
const NavbarWithNoSSR = dynamic(
  () => import('./Navbar').then(mod => {
    // Wrap Navbar with React.memo to prevent unnecessary re-renders
    const { default: Navbar } = mod;
    return { default: React.memo(Navbar) };
  }),
  { ssr: false }
);

export default function ClientNavbar() {
  return <NavbarWithNoSSR />;
} 