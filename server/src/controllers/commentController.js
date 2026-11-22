import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Helper to check user access to the task's project
const checkTaskAccess = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) {
    const error = new Error('Task not found');
    error.statusCode = 404;
    throw error;
  }

  const project = await Project.findById(task.project);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const userIdStr = userId.toString();
  const isOwner = project.owner.toString() === userIdStr;
  const isMember = project.members.some((m) => m.toString() === userIdStr);

  if (!isOwner && !isMember) {
    const error = new Error('Not authorized to access comments for this task');
    error.statusCode = 403;
    throw error;
  }

  return { task, project };
};

// @desc   Get comments for a task
// @route  GET /api/tasks/:taskId/comments
// @access Private
export const getCommentsByTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  await checkTaskAccess(taskId, req.user._id);

  const comments = await Comment.find({ task: taskId })
    .populate('author', '_id name email')
    .sort({ createdAt: 1 })
    .lean();

  res.status(200).json(comments);
});

// @desc   Create comment on a task
// @route  POST /api/tasks/:taskId/comments
// @access Private
export const createComment = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  await checkTaskAccess(taskId, req.user._id);

  const { text } = req.body;

  const comment = await Comment.create({
    task: taskId,
    author: req.user._id,
    text
  });

  const populated = await Comment.findById(comment._id)
    .populate('author', '_id name email')
    .lean();

  res.status(201).json(populated);
});

// @desc   Delete comment
// @route  DELETE /api/comments/:id
// @access Private (Author only)
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  if (comment.author.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this comment');
  }

  await Comment.findByIdAndDelete(comment._id);

  res.status(200).json({ message: 'Comment deleted' });
});
