import express from 'express';
import { body } from 'express-validator';
import {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject
} from '../controllers/projectController.js';
import {
  getTasksByProject,
  createTask
} from '../controllers/taskController.js';
import { getProjectAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(
    [
      body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Project name must be between 2 and 100 characters'),
      body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters')
    ],
    validate,
    createProject
  );

// Analytics under project
router.get('/:projectId/analytics', getProjectAnalytics);

// Tasks under project
router
  .route('/:projectId/tasks')
  .get(getTasksByProject)
  .post(
    [
      body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
      body('description').optional().isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
      body('status').optional().isIn(['Todo', 'In Progress', 'Review', 'Done']).withMessage('Invalid status'),
      body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority')
    ],
    validate,
    createTask
  );

router
  .route('/:id')
  .get(getProjectById)
  .put(
    [
      body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Project name must be between 2 and 100 characters'),
      body('description').optional().isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters')
    ],
    validate,
    updateProject
  )
  .delete(deleteProject);

export default router;
