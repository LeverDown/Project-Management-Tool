import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Task title must be at least 1 character'],
      maxlength: [200, 'Task title cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: ''
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project reference is required'],
      index: true
    },
    status: {
      type: String,
      enum: {
        values: ['Todo', 'In Progress', 'Review', 'Done'],
        message: '{VALUE} is not a valid status'
      },
      default: 'Todo'
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority'
      },
      default: 'Medium'
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    startDate: {
      type: Date,
      default: null
    },
    dueDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          if (!value || !this.startDate) return true;
          return new Date(value) >= new Date(this.startDate);
        },
        message: 'Due date must be on or after start date'
      }
    },
    order: {
      type: Number,
      required: [true, 'Order is required'],
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ project: 1, status: 1, order: 1 });

const Task = mongoose.model('Task', taskSchema);
export default Task;
