import { NextResponse } from 'next/server';
import RoadmapModel from '../../../models/Roadmap';
import connectDB from '../../../lib/mongodb';

// Get a single roadmap by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const roadmap = await RoadmapModel.findById(id);
    
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
    console.error('Error fetching roadmap:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching roadmap' },
      { status: 500 }
    );
  }
}

// Update a roadmap
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    const body = await request.json();
    
    const roadmap = await RoadmapModel.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );
    
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
    console.error('Error updating roadmap:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating roadmap' },
      { status: 500 }
    );
  }
}

// Delete a roadmap
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const { id } = params;
    
    const roadmap = await RoadmapModel.findByIdAndDelete(id);
    
    if (!roadmap) {
      return NextResponse.json(
        { success: false, message: 'Roadmap not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Roadmap deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting roadmap' },
      { status: 500 }
    );
  }
} 