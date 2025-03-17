import { IRoadmap, PermissionLevel } from '../models/Roadmap';
import { User } from '../context/AuthContext';

// Check if a user has any level of access to a roadmap
export function hasAccess(roadmap: IRoadmap, user: User | null): boolean {
  // If roadmap is public, anyone has access
  if (roadmap.isPublic) {
    return true;
  }
  
  // If no user, and roadmap is not public, no access
  if (!user) {
    return false;
  }
  
  // Roadmap owner always has access
  if (roadmap.user.toString() === user._id) {
    return true;
  }
  
  // Check if user is in the sharedWith array
  return roadmap.sharedWith.some(shared => 
    shared.email === user.email || 
    (shared.user && shared.user.toString() === user._id)
  );
}

// Check if user has specific permission level or higher
export function hasPermission(
  roadmap: IRoadmap, 
  user: User | null, 
  requiredLevel: PermissionLevel
): boolean {
  // No user and non-public roadmap means no permission
  if (!user && !roadmap.isPublic) {
    // For view permission, public roadmaps are accessible without a user
    return roadmap.isPublic && requiredLevel === 'view';
  }
  
  // If no user but roadmap is public, only allow view permission
  if (!user && roadmap.isPublic) {
    return requiredLevel === 'view';
  }
  
  // Owner has all permissions
  if (user && roadmap.user.toString() === user._id) {
    return true;
  }
  
  // If user isn't the owner, check sharedWith array
  if (user) {
    const sharedPermission = roadmap.sharedWith.find(shared => 
      shared.email === user.email || 
      (shared.user && shared.user.toString() === user._id)
    );
    
    if (sharedPermission) {
      // Check if user's permission is sufficient
      if (requiredLevel === 'view') {
        // Any permission level allows viewing
        return true;
      } else if (requiredLevel === 'edit') {
        // Edit or admin permission allows editing
        return ['edit', 'admin'].includes(sharedPermission.permissionLevel);
      } else if (requiredLevel === 'admin') {
        // Only admin permission allows admin actions
        return sharedPermission.permissionLevel === 'admin';
      }
    }
  }
  
  return false;
}

// Get the user's permission level for a roadmap
export function getUserPermissionLevel(
  roadmap: IRoadmap, 
  user: User | null
): PermissionLevel | null {
  // No user and non-public roadmap means no permission
  if (!user && !roadmap.isPublic) {
    return null;
  }
  
  // If no user but roadmap is public, they have view permission
  if (!user && roadmap.isPublic) {
    return 'view';
  }
  
  // Owner has admin permission
  if (user && roadmap.user.toString() === user._id) {
    return 'admin';
  }
  
  // Check the user's specific permission
  if (user) {
    const sharedPermission = roadmap.sharedWith.find(shared => 
      shared.email === user.email || 
      (shared.user && shared.user.toString() === user._id)
    );
    
    if (sharedPermission) {
      return sharedPermission.permissionLevel;
    }
  }
  
  // If roadmap is public, any authenticated user has view permission
  if (roadmap.isPublic) {
    return 'view';
  }
  
  return null;
} 