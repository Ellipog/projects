import { NextResponse } from 'next/server';
import RoadmapModel from '../../../../models/Roadmap';
import connectDB from '../../../../lib/mongodb';

// Get roadmap by slug (for sharing via URL)
export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();
    
    // Wait for params to be available
    const params = await context.params;
    const { slug } = params;
    
    // Find roadmap by slug
    const roadmap = await RoadmapModel.findOne({ slug });
    
    if (!roadmap) {
      return NextResponse.json(
        { success: false, message: 'Roadmap not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: roadmap 
    });
  } catch (error) {
    console.error('Error fetching roadmap by slug:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching roadmap' },
      { status: 500 }
    );
  }
} 