import { NextResponse, NextRequest } from 'next/server';
import RoadmapModel from '../../../models/Roadmap';
import connectDB from '../../../lib/mongodb';

// Share a roadmap with others
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { roadmapId, email, permissionLevel } = body;
    
    if (!roadmapId || !email || !permissionLevel) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate permission level
    if (!['view', 'edit', 'admin'].includes(permissionLevel)) {
      return NextResponse.json(
        { success: false, message: 'Invalid permission level' },
        { status: 400 }
      );
    }
    
    // Find the roadmap
    const roadmap = await RoadmapModel.findById(roadmapId);
    
    if (!roadmap) {
      return NextResponse.json(
        { success: false, message: 'Roadmap not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is already in the sharedWith array
    const existingShareIndex = roadmap.sharedWith.findIndex(
      share => share.email === email
    );
    
    if (existingShareIndex !== -1) {
      // Update existing share
      roadmap.sharedWith[existingShareIndex].permissionLevel = permissionLevel;
    } else {
      // Add new share
      roadmap.sharedWith.push({
        email,
        permissionLevel
      });
    }
    
    await roadmap.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Roadmap shared successfully',
      data: roadmap
    });
  } catch (error) {
    console.error('Error sharing roadmap:', error);
    return NextResponse.json(
      { success: false, message: 'Error sharing roadmap' },
      { status: 500 }
    );
  }
}

// Remove sharing for a roadmap
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const roadmapId = url.searchParams.get('roadmapId');
    const email = url.searchParams.get('email');
    
    if (!roadmapId || !email) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Find the roadmap
    const roadmap = await RoadmapModel.findById(roadmapId);
    
    if (!roadmap) {
      return NextResponse.json(
        { success: false, message: 'Roadmap not found' },
        { status: 404 }
      );
    }
    
    // Remove the share
    roadmap.sharedWith = roadmap.sharedWith.filter(
      share => share.email !== email
    );
    
    await roadmap.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sharing removed successfully',
      data: roadmap
    });
  } catch (error) {
    console.error('Error removing sharing:', error);
    return NextResponse.json(
      { success: false, message: 'Error removing sharing' },
      { status: 500 }
    );
  }
} 