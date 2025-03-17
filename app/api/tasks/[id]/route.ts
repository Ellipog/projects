import { NextRequest, NextResponse } from 'next/server';
import TaskModel from '../../../models/Task';
import connectDB from '../../../lib/mongodb';
import mongoose from 'mongoose';

// GET - Fetch a task by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  if (!id) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }

  try {
    await connectDB();
    console.log(`Fetching task with ID: ${id}`);
    
    // Try both MongoDB ID and custom ID lookup
    let task = null;
    
    // Try MongoDB ID first if valid
    if (mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Looking up by MongoDB ID: ${id}`);
      task = await TaskModel.findById(id);
    }
    
    // If not found, try by customId field
    if (!task) {
      console.log(`Looking up by custom ID: ${id}`);
      task = await TaskModel.findOne({ customId: id });
    }
    
    // If still not found, try by id field as string
    if (!task) {
      console.log(`Looking up by id as string: ${id}`);
      task = await TaskModel.findOne({ id: id });
    }
    
    if (!task) {
      console.log(`Task not found with ID: ${id}`);
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    console.log(`Task found: ${task._id}`);
    
    // Transform the response to always use customId as the primary ID
    const responseTask = task.toJSON();
    responseTask.id = responseTask.customId;
    
    return NextResponse.json(responseTask);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

// PUT - Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  if (!id) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }

  try {
    await connectDB();
    const body = await request.json();
    console.log(`Updating task with ID: ${id}`, body);
    
    let task = null;
    
    // Try MongoDB ID first if valid
    if (mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Updating by MongoDB ID: ${id}`);
      task = await TaskModel.findByIdAndUpdate(
        id,
        { ...body },
        { new: true, runValidators: true }
      );
    }
    
    // If not found, try by customId field
    if (!task) {
      console.log(`Updating by custom ID: ${id}`);
      task = await TaskModel.findOneAndUpdate(
        { customId: id },
        { ...body },
        { new: true, runValidators: true }
      );
    }
    
    // If still not found, try by id field as string
    if (!task) {
      console.log(`Updating by id as string: ${id}`);
      task = await TaskModel.findOneAndUpdate(
        { id: id },
        { ...body },
        { new: true, runValidators: true }
      );
    }
    
    if (!task) {
      console.log(`Task not found for update: ${id}`);
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    console.log(`Task updated: ${task._id}`);
    
    // Transform the response to always use customId as the primary ID
    const responseTask = task.toJSON();
    responseTask.id = responseTask.customId;
    
    return NextResponse.json(responseTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE - Remove a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  
  if (!id) {
    return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
  }

  try {
    await connectDB();
    console.log(`Deleting task with ID: ${id}`);
    
    let task = null;
    
    // Try MongoDB ID first if valid
    if (mongoose.Types.ObjectId.isValid(id)) {
      console.log(`Deleting by MongoDB ID: ${id}`);
      task = await TaskModel.findByIdAndDelete(id);
    }
    
    // If not found, try by customId field
    if (!task) {
      console.log(`Deleting by custom ID: ${id}`);
      task = await TaskModel.findOneAndDelete({ customId: id });
    }
    
    // If still not found, try by id field as string
    if (!task) {
      console.log(`Deleting by id as string: ${id}`);
      task = await TaskModel.findOneAndDelete({ id: id });
    }
    
    if (!task) {
      console.log(`Task not found for deletion: ${id}`);
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    
    console.log(`Task deleted: ${task._id}, customId: ${task.customId}`);
    return NextResponse.json({ message: 'Task deleted successfully', id: task.customId });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
} 