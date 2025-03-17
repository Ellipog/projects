import { RoadmapData } from './types';

// Creating sample data for the roadmap
const initialData: RoadmapData = {
  tasks: {
    'task-1': {
      id: 'task-1',
      title: 'Research & Planning',
      description: 'Initial research and project planning',
      startTime: new Date(2024, 2, 15, 9, 0), // March 15, 2024, 9:00 AM
      endTime: new Date(2024, 2, 15, 12, 0),  // March 15, 2024, 12:00 PM
      status: 'done',
      color: 'bg-blue-100 border-blue-500',
      comments: [
        {
          id: 'comment-1',
          content: 'Successfully completed the market research',
          author: 'John Smith',
          createdAt: new Date(2024, 2, 15, 12, 5)
        }
      ],
      attributes: [
        {
          id: 'field-1',
          name: 'Priority',
          value: 'High',
          type: 'select',
          options: ['Low', 'Medium', 'High']
        },
        {
          id: 'field-2',
          name: 'Estimated Hours',
          value: '3',
          type: 'number'
        }
      ]
    },
    'task-2': {
      id: 'task-2',
      title: 'UI Design',
      description: 'Create wireframes and UI mockups',
      startTime: new Date(2024, 2, 16, 13, 0), // March 16, 2024, 1:00 PM
      endTime: new Date(2024, 2, 16, 17, 0),   // March 16, 2024, 5:00 PM
      status: 'in-progress',
      color: 'bg-purple-100 border-purple-500',
      comments: [],
      attributes: [
        {
          id: 'field-3',
          name: 'Designer',
          value: 'Emma Wilson',
          type: 'text'
        }
      ]
    },
    'task-3': {
      id: 'task-3',
      title: 'Frontend Development',
      description: 'Implement the UI components',
      startTime: new Date(2024, 2, 17, 10, 0), // March 17, 2024, 10:00 AM
      endTime: new Date(2024, 2, 18, 16, 0),   // March 18, 2024, 4:00 PM
      status: 'todo',
      color: 'bg-green-100 border-green-500',
      comments: [],
      attributes: []
    },
    'task-4': {
      id: 'task-4',
      title: 'Backend Integration',
      description: 'Connect with API endpoints',
      startTime: new Date(2024, 2, 19, 9, 0),  // March 19, 2024, 9:00 AM
      endTime: new Date(2024, 2, 20, 18, 0),   // March 20, 2024, 6:00 PM
      status: 'todo',
      color: 'bg-yellow-100 border-yellow-500',
      comments: [],
      attributes: []
    },
    'task-5': {
      id: 'task-5',
      title: 'Testing',
      description: 'Perform unit and integration tests',
      startTime: new Date(2024, 2, 21, 14, 0), // March 21, 2024, 2:00 PM
      endTime: new Date(2024, 2, 22, 17, 0),   // March 22, 2024, 5:00 PM
      status: 'todo',
      color: 'bg-red-100 border-red-500',
      comments: [],
      attributes: []
    }
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'To Do',
      taskIds: ['task-3', 'task-4', 'task-5']
    },
    'column-2': {
      id: 'column-2',
      title: 'In Progress',
      taskIds: ['task-2']
    },
    'column-3': {
      id: 'column-3',
      title: 'Done',
      taskIds: ['task-1']
    }
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
  presetTasks: {
    'preset-1': {
      title: 'Bug Fix',
      description: 'Fix a reported bug in the application',
      startTime: new Date(),
      endTime: new Date(new Date().setHours(new Date().getHours() + 3)),
      color: 'bg-red-100 border-red-500',
      comments: [],
      attributes: [
        {
          id: 'preset-field-1',
          name: 'Severity',
          value: 'Medium',
          type: 'select',
          options: ['Low', 'Medium', 'High', 'Critical']
        }
      ]
    },
    'preset-2': {
      title: 'Feature Implementation',
      description: 'Implement a new feature according to specifications',
      startTime: new Date(),
      endTime: new Date(new Date().setHours(new Date().getHours() + 8)),
      color: 'bg-blue-100 border-blue-500',
      comments: [],
      attributes: [
        {
          id: 'preset-field-2',
          name: 'Feature Type',
          value: 'UI Enhancement',
          type: 'select',
          options: ['UI Enhancement', 'Performance Optimization', 'New Functionality', 'Integration']
        }
      ]
    },
    'preset-3': {
      title: 'Meeting',
      description: 'Team meeting to discuss project progress',
      startTime: new Date(),
      endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
      color: 'bg-purple-100 border-purple-500',
      comments: [],
      attributes: [
        {
          id: 'preset-field-3',
          name: 'Meeting Type',
          value: 'Status Update',
          type: 'select',
          options: ['Planning', 'Status Update', 'Retrospective', 'Demo']
        }
      ]
    }
  }
};

export default initialData; 