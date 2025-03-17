import { NextResponse } from 'next/server';
import RoadmapModel from '../../models/Roadmap';
import connectDB from '../../lib/mongodb';

// Get all roadmaps
export async function GET(request: Request) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    const query: any = {};
    
    // Only return roadmaps for the specified user
    if (userId) {
      query.user = userId;
    }
    
    const roadmaps = await RoadmapModel.find(query);
    
    return NextResponse.json({ 
      success: true, 
      data: roadmaps 
    });
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching roadmaps' },
      { status: 500 }
    );
  }
}

// Create a new roadmap
export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Create a new roadmap
    const roadmap = await RoadmapModel.create(body);
    
    return NextResponse.json(
      { success: true, data: roadmap },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating roadmap:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating roadmap' },
      { status: 500 }
    );
  }
} 