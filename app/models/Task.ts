import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for Comment document
export interface IComment extends Document {
  content: string;
  author: string;
  createdAt: Date;
}

// Interface for Attribute document
export interface IAttribute extends Document {
  name: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
}

// Interface for Task document
export interface ITask extends Document {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  status: 'todo' | 'in-progress' | 'done';
  color?: string;
  comments: IComment[];
  attributes: IAttribute[];
  user: mongoose.Types.ObjectId;
  roadmap: mongoose.Types.ObjectId;
  customId?: string;
}

// Create Comment Schema
const CommentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true
    },
    author: {
      type: String,
      required: [true, 'Author is required']
    }
  },
  {
    timestamps: true
  }
);

// Create Attribute Schema
const AttributeSchema = new Schema<IAttribute>(
  {
    name: {
      type: String,
      required: [true, 'Attribute name is required'],
      trim: true
    },
    value: {
      type: String,
      required: [true, 'Attribute value is required'],
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'select'],
      default: 'text'
    },
    options: [{
      type: String
    }]
  }
);

// Create Task Schema
const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo'
    },
    color: {
      type: String
    },
    customId: {
      type: String,
      index: true
    },
    comments: [CommentSchema],
    attributes: [AttributeSchema],
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      auto: true
    },
    roadmap: {
      type: Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: [true, 'Roadmap is required'],
      auto: true
    }
  },
  {
    timestamps: true
  }
);

// Check if the model is already defined to avoid model overwrite error in development
const TaskModel: Model<ITask> = mongoose.models.Task as Model<ITask> || mongoose.model<ITask>('Task', TaskSchema);

export default TaskModel; 