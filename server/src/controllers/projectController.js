import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc   Get all projects where user is owner or member
// @route  GET /api/projects
// @access Private
export const getProjects = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const projects = await Project.find({
    $or: [{ owner: userId }, { members: userId }]
  })
    .populate('owner', '_id name email')
    .populate('members', '_id name email')
    .sort({ createdAt: -1 })
    .lean();

  const projectIds = projects.map((p) => p._id);
  const taskCounts = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    { $group: { _id: '$project', count: { $sum: 1 } } }
  ]);

  const countMap = {};
  taskCounts.forEach((tc) => {
    countMap[tc._id.toString()] = tc.count;
  });

  const projectsWithCounts = projects.map((p) => ({
    ...p,
    taskCount: countMap[p._id.toString()] || 0
  }));

  res.status(200).json(projectsWithCounts);
});

// @desc   Create a project
// @route  POST /api/projects
// @access Private
export const createProject = asyncHandler(async (req, res) => {
  const { name, description, members } = req.body;
  const userId = req.user._id;

  // Build members array, ensuring owner is always included
  const memberSet = new Set([userId.toString()]);
  if (Array.isArray(members)) {
    members.forEach((m) => {
      if (m) memberSet.add(m.toString());
    });
  }

  const project = await Project.create({
    name,
    description: description || '',
    owner: userId,
    members: Array.from(memberSet)
  });

  const populated = await Project.findById(project._id)
    .populate('owner', '_id name email')
    .populate('members', '_id name email')
    .lean();

  res.status(201).json({
    ...populated,
    taskCount: 0
  });
});

// @desc   Get single project by ID
// @route  GET /api/projects/:id
// @access Private
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('owner', '_id name email')
    .populate('members', '_id name email')
    .lean();

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const userIdStr = req.user._id.toString();
  const isOwner = project.owner._id.toString() === userIdStr;
  const isMember = project.members.some((m) => m._id.toString() === userIdStr);

  if (!isOwner && !isMember) {
    res.status(403);
    throw new Error('Not authorized to access this project');
  }

  const taskCount = await Task.countDocuments({ project: project._id });

  res.status(200).json({
    ...project,
    taskCount
  });
});

// @desc   Update project
// @route  PUT /api/projects/:id
// @access Private (Owner only)
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the project owner can update this project');
  }

  const { name, description, members } = req.body;

  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;

  if (members !== undefined && Array.isArray(members)) {
    const memberSet = new Set([project.owner.toString()]);
    members.forEach((m) => {
      if (m) memberSet.add(m.toString());
    });
    project.members = Array.from(memberSet);
  }

  await project.save();

  const updated = await Project.findById(project._id)
    .populate('owner', '_id name email')
    .populate('members', '_id name email')
    .lean();

  const taskCount = await Task.countDocuments({ project: project._id });

  res.status(200).json({
    ...updated,
    taskCount
  });
});

// @desc   Delete project (cascade delete tasks and comments)
// @route  DELETE /api/projects/:id
// @access Private (Owner only)
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the project owner can delete this project');
  }

  const tasks = await Task.find({ project: project._id }).select('_id');
  const taskIds = tasks.map((t) => t._id);

  if (taskIds.length > 0) {
    await Comment.deleteMany({ task: { $in: taskIds } });
    await Task.deleteMany({ project: project._id });
  }

  await Project.findByIdAndDelete(project._id);

  res.status(200).json({ message: 'Project and all associated tasks and comments deleted' });
});
