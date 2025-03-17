import { NextResponse } from 'next/server';
import RoadmapModel from '../../../../models/Roadmap';
import connectDB from '../../../../lib/mongodb';

interface RouteParams {
  params: {
    id: string;
  };
}

// Toggle public visibility of a roadmap
export async function PATCH(request: Request, context: RouteParams) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    const body = await request.json();
    const { isPublic } = body;
    
    if (isPublic === undefined) {
      return NextResponse.json(
        { success: false, message: 'isPublic field is required' },
        { status: 400 }
      );
    }
    
    // Find and update the roadmap
    const roadmap = await RoadmapModel.findByIdAndUpdate(
      id,
      { $set: { isPublic } },
      { new: true }
    );
    
    if (!roadmap) {
      return NextResponse.json(
        { success: false, message: 'Roadmap not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Roadmap is now ${isPublic ? 'public' : 'private'}`,
      data: roadmap
    });
  } catch (error) {
    console.error('Error updating roadmap visibility:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating roadmap visibility' },
      { status: 500 }
    );
  }
} 