import { NextResponse } from 'next/server';
import TaskModel from '../../../../../models/Task';
import RoadmapModel from '../../../../../models/Roadmap';
import connectDB from '../../../../../lib/mongodb';
import mongoose from 'mongoose';
import { NextRequest } from 'next/server';

// Bulk update tasks and column orders
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const roadmapId = params.id;
    const { tasks, columns, columnOrder } = await request.json();
    
    // First, check if the roadmap exists
    const roadmap = await RoadmapModel.findById(roadmapId);
    
    if (!roadmap) {
      return NextResponse.json(
        { success: false, message: 'Roadmap not found' },
        { status: 404 }
      );
    }
    
    // Update roadmap columns and column order if provided
    if (columns && columnOrder) {
      await RoadmapModel.findByIdAndUpdate(roadmapId, {
        columns,
        columnOrder
      });
    }
    
    // Update task statuses in bulk if provided
    if (tasks && tasks.length > 0) {
      const updatePromises = tasks.map((task: { _id: string; id: string; status: string }) => {
        const taskId = task._id || task.id;
        
        // Check if the ID is a MongoDB ObjectId or a custom string ID
        if (mongoose.Types.ObjectId.isValid(taskId)) {
          return TaskModel.findByIdAndUpdate(
            taskId,
            { status: task.status },
            { new: true }
          );
        } else {
          // For custom string IDs like "task-1742212779526"
          return TaskModel.findOneAndUpdate(
            { customId: taskId },
            { status: task.status },
            { new: true }
          );
        }
      });
      
      await Promise.all(updatePromises);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Tasks and roadmap updated successfully'
    });
  } catch (error) {
    console.error('Error bulk updating tasks:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating tasks' },
      { status: 500 }
    );
  }
} 