import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for Column document
export interface IColumn extends Document {
  title: string;
  taskIds: string[];
}

// Define user permission types
export type PermissionLevel = 'view' | 'edit' | 'admin';

// Interface for shared user permissions
export interface ISharedUser {
  user?: mongoose.Types.ObjectId; // Optional for email invites without registered users
  email: string;
  permissionLevel: PermissionLevel;
}

// Interface for Roadmap document
export interface IRoadmap extends Document {
  title: string;
  description?: string;
  columns: Record<string, IColumn>;
  columnOrder: string[];
  user: mongoose.Types.ObjectId;
  isPublic: boolean; // Whether anyone with link can view
  slug: string; // URL-friendly identifier
  sharedWith: ISharedUser[];
  createdAt: Date;
  updatedAt: Date;
}

// Create Column Schema
const ColumnSchema = new Schema<IColumn>(
  {
    title: {
      type: String,
      required: [true, 'Column title is required'],
      trim: true
    },
    taskIds: [{
      type: String
    }]
  }
);

// Create shared user schema
const SharedUserSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  permissionLevel: {
    type: String,
    enum: ['view', 'edit', 'admin'],
    default: 'view'
  }
});

// Create Roadmap Schema
const RoadmapSchema = new Schema<IRoadmap>(
  {
    title: {
      type: String,
      required: [true, 'Roadmap title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    columns: {
      type: Map,
      of: ColumnSchema
    },
    columnOrder: [{
      type: String
    }],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    slug: {
      type: String,
      unique: true,
      sparse: true
    },
    sharedWith: [SharedUserSchema]
  },
  {
    timestamps: true
  }
);

// Generate a slug from the title
RoadmapSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('title')) {
    // Create a slug from the title
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Add random string to ensure uniqueness
    const randomString = Math.random().toString(36).substring(2, 8);
    this.slug = `${baseSlug}-${randomString}`;
  }
  next();
});

// Check if the model is already defined to avoid model overwrite error in development
const RoadmapModel: Model<IRoadmap> = mongoose.models.Roadmap as Model<IRoadmap> || mongoose.model<IRoadmap>('Roadmap', RoadmapSchema);

export default RoadmapModel; 