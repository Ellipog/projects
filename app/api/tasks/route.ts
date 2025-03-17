import { NextResponse } from 'next/server';
import TaskModel from '../../models/Task';
import connectDB from '../../lib/mongodb';

// Get all tasks
export async function GET(request: Request) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const roadmapId = url.searchParams.get('roadmapId');
    
    const query: any = {};
    
    if (userId) {
      query.user = userId;
    }
    
    if (roadmapId) {
      query.roadmap = roadmapId;
    }
    
    const tasks = await TaskModel.find(query);
    
    return NextResponse.json({ 
      success: true, 
      data: tasks 
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching tasks' },
      { status: 500 }
    );
  }
}

// Create a new task
export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Ensure required fields are present
    if (!body.roadmapId) {
      return NextResponse.json(
        { success: false, message: "Roadmap ID is required" },
        { status: 400 }
      );
    }
    
    // For user ID, either get it from the request body or from the current session
    // Depending on your auth setup, you might want to validate that the user is authenticated
    const userId = body.userId;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }
    
    // Create task with properly mapped fields
    const task = await TaskModel.create({
      title: body.title,
      description: body.description,
      startTime: body.startTime,
      endTime: body.endTime,
      status: body.status || 'todo', // Default to 'todo' if not provided
      color: body.color,
      comments: body.comments || [],
      attributes: body.attributes || [],
      roadmap: body.roadmapId, // Map roadmapId to roadmap
      user: userId // Map userId to user
    });
    
    return NextResponse.json(
      { success: true, data: task },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating task', error: (error as Error).message },
      { status: 500 }
    );
  }
} 