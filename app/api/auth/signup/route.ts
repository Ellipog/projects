import { NextResponse } from 'next/server';
import User from '../../../models/User';
import connectDB from '../../../lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectDB();
    
    // Parse the request body
    const body = await request.json();
    const { username, email, password } = body;
    
    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 409 }
      );
    }
    
    // Create new user
    const user = await User.create({
      username,
      email,
      password
    });
    
    // Remove password from response
    const userObject = user.toObject();
    const safeUserObject = { ...userObject };
    delete (safeUserObject as any).password;
    
    return NextResponse.json(
      { success: true, user: safeUserObject },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Error creating user' },
      { status: 500 }
    );
  }
} 