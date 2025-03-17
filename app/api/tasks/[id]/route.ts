import { NextResponse } from 'next/server';
import TaskModel from '../../../models/Task';
import connectDB from '../../../lib/mongodb';

// Get a single task by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const taskId = params.id;
    const task = await TaskModel.findById(taskId);
    
    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching task' },
      { status: 500 }
    );
  }
}

// Update a task by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const taskId = params.id;
    const body = await request.json();
    
    const task = await TaskModel.findByIdAndUpdate(
      taskId,
      body,
      { new: true, runValidators: true }
    );
    
    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating task' },
      { status: 500 }
    );
  }
}

// Delete a task by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const taskId = params.id;
    const task = await TaskModel.findByIdAndDelete(taskId);
    
    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: 'Task deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting task' },
      { status: 500 }
    );
  }
} 