import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Comment from '../models/Comment.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Helper to check user access to project
const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const userIdStr = userId.toString();
  const isOwner = project.owner.toString() === userIdStr;
  const isMember = project.members.some((m) => m.toString() === userIdStr);

  if (!isOwner && !isMember) {
    const error = new Error('Not authorized to access tasks for this project');
    error.statusCode = 403;
    throw error;
  }

  return project;
};

// @desc   Get all tasks for a project
// @route  GET /api/projects/:projectId/tasks
// @access Private
export const getTasksByProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  await checkProjectAccess(projectId, req.user._id);

  const tasks = await Task.find({ project: projectId })
    .populate('assignee', '_id name email')
    .sort({ status: 1, order: 1 })
    .lean();

  const taskIds = tasks.map((t) => t._id);
  const commentCounts = await Comment.aggregate([
    { $match: { task: { $in: taskIds } } },
    { $group: { _id: '$task', count: { $sum: 1 } } }
  ]);

  const countMap = {};
  commentCounts.forEach((c) => {
    countMap[c._id.toString()] = c.count;
  });

  const tasksWithCount = tasks.map((task) => ({
    ...task,
    commentCount: countMap[task._id.toString()] || 0
  }));

  res.status(200).json(tasksWithCount);
});

// @desc   Create a task in a project
// @route  POST /api/projects/:projectId/tasks
// @access Private
export const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  await checkProjectAccess(projectId, req.user._id);

  const {
    title,
    description,
    status = 'Todo',
    priority = 'Medium',
    assignee = null,
    startDate = null,
    dueDate = null
  } = req.body;

  if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
    res.status(400);
    throw new Error('Due date must be on or after start date');
  }

  // Find max order in target status column to append to the end
  const lastTask = await Task.findOne({
    project: projectId,
    status
  }).sort({ order: -1 });

  const order = lastTask ? lastTask.order + 1 : 0;

  const task = await Task.create({
    title,
    description: description || '',
    project: projectId,
    status,
    priority,
    assignee: assignee || null,
    startDate: startDate || null,
    dueDate: dueDate || null,
    order,
    createdBy: req.user._id
  });

  const populated = await Task.findById(task._id)
    .populate('assignee', '_id name email')
    .lean();

  res.status(201).json({
    ...populated,
    commentCount: 0
  });
});

// @desc   Reorder tasks across columns (Kanban drag-and-drop)
// @route  PATCH /api/tasks/reorder
// @access Private
export const reorderTasks = asyncHandler(async (req, res) => {
  const { projectId, columns } = req.body;

  if (!projectId || !columns || typeof columns !== 'object') {
    res.status(400);
    throw new Error('projectId and columns map are required');
  }

  await checkProjectAccess(projectId, req.user._id);

  // Extract all task IDs from columns map
  const allTaskIds = [];
  const validStatuses = ['Todo', 'In Progress', 'Review', 'Done'];

  for (const status of Object.keys(columns)) {
    if (!validStatuses.includes(status)) {
      res.status(400);
      throw new Error(`Invalid status key: ${status}`);
    }
    const taskIds = columns[status];
    if (Array.isArray(taskIds)) {
      for (const id of taskIds) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          res.status(400);
          throw new Error(`Invalid task ID: ${id}`);
        }
        allTaskIds.push(new mongoose.Types.ObjectId(id));
      }
    }
  }

  // Verify that all task IDs belong to projectId
  if (allTaskIds.length > 0) {
    const matchingTasks = await Task.find({
      _id: { $in: allTaskIds },
      project: projectId
    }).select('_id');

    if (matchingTasks.length !== allTaskIds.length) {
      res.status(400);
      throw new Error('One or more tasks do not belong to the specified project');
    }
  }

  // Build bulkWrite operations
  const bulkOps = [];
  for (const [status, taskIds] of Object.entries(columns)) {
    if (Array.isArray(taskIds)) {
      taskIds.forEach((taskId, index) => {
        bulkOps.push({
          updateOne: {
            filter: { _id: taskId, project: projectId },
            update: { $set: { status, order: index } }
          }
        });
      });
    }
  }

  if (bulkOps.length > 0) {
    await Task.bulkWrite(bulkOps);
  }

  res.status(200).json({ message: 'Reordered' });
});

// @desc   Get single task by ID
// @route  GET /api/tasks/:id
// @access Private
export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignee', '_id name email')
    .populate('createdBy', '_id name email')
    .lean();

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await checkProjectAccess(task.project, req.user._id);

  const commentCount = await Comment.countDocuments({ task: task._id });

  res.status(200).json({
    ...task,
    commentCount
  });
});

// @desc   Update editable task fields (not order/project)
// @route  PUT /api/tasks/:id
// @access Private
export const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await checkProjectAccess(task.project, req.user._id);

  const { title, description, status, priority, assignee, startDate, dueDate } = req.body;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (assignee !== undefined) task.assignee = assignee || null;
  if (startDate !== undefined) task.startDate = startDate || null;
  if (dueDate !== undefined) task.dueDate = dueDate || null;

  if (task.startDate && task.dueDate && new Date(task.dueDate) < new Date(task.startDate)) {
    res.status(400);
    throw new Error('Due date must be on or after start date');
  }

  await task.save();

  const updated = await Task.findById(task._id)
    .populate('assignee', '_id name email')
    .populate('createdBy', '_id name email')
    .lean();

  const commentCount = await Comment.countDocuments({ task: task._id });

  res.status(200).json({
    ...updated,
    commentCount
  });
});

// @desc   Delete task and its comments
// @route  DELETE /api/tasks/:id
// @access Private
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Task not found');
  }

  await checkProjectAccess(task.project, req.user._id);

  await Comment.deleteMany({ task: task._id });
  await Task.findByIdAndDelete(task._id);

  res.status(200).json({ message: 'Task and comments deleted' });
});
