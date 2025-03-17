import { NextResponse, NextRequest } from 'next/server';
import TaskModel from '../../models/Task';
import connectDB from '../../lib/mongodb';
import mongoose from 'mongoose';

// Get all tasks
export async function GET(request: NextRequest) {
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
    
    // Transform tasks to always use customId as the primary ID
    const responseTasks = tasks.map(task => {
      const taskObj = task.toJSON();
      taskObj.id = taskObj.customId;
      return taskObj;
    });
    
    return NextResponse.json({ 
      success: true, 
      data: responseTasks 
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
export async function POST(request: NextRequest) {
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
    const userId = body.userId;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }
    
    // Use the provided ID if it exists, otherwise create a timestamp-based ID
    const customId = body.id || `task-${Date.now()}`;
    
    // Convert string IDs to ObjectIDs if needed
    let userObjectId = userId;
    let roadmapObjectId = body.roadmapId;
    
    try {
      // Try to create ObjectIDs if they're not already
      if (typeof userId === 'string' && !mongoose.Types.ObjectId.isValid(userId)) {
        userObjectId = new mongoose.Types.ObjectId();
      }
      
      if (typeof body.roadmapId === 'string' && !mongoose.Types.ObjectId.isValid(body.roadmapId)) {
        roadmapObjectId = new mongoose.Types.ObjectId();
      }
    } catch (error) {
      console.error('Error converting IDs to ObjectIds:', error);
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
      roadmap: roadmapObjectId, // Use converted ObjectId
      user: userObjectId, // Use converted ObjectId
      customId // Set the custom ID
    });
    
    // Transform the response to always use customId as the primary ID
    const responseTask = task.toJSON();
    responseTask.id = responseTask.customId;
    
    return NextResponse.json(
      { success: true, data: responseTask },
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