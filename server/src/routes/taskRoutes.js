import express from 'express';
import { body } from 'express-validator';
import {
  reorderTasks,
  getTaskById,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import {
  getCommentsByTask,
  createComment
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

// IMPORTANT: /reorder must be mounted before /:id so 'reorder' is not captured as an :id parameter
router.patch(
  '/reorder',
  [
    body('projectId').notEmpty().withMessage('projectId is required'),
    body('columns').isObject().withMessage('columns must be an object')
  ],
  validate,
  reorderTasks
);

// Comments for a task
router
  .route('/:taskId/comments')
  .get(getCommentsByTask)
  .post(
    [
      body('text').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment text must be between 1 and 2000 characters')
    ],
    validate,
    createComment
  );

router
  .route('/:id')
  .get(getTaskById)
  .put(
    [
      body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
      body('description').optional().isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
      body('status').optional().isIn(['Todo', 'In Progress', 'Review', 'Done']).withMessage('Invalid status'),
      body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority')
    ],
    validate,
    updateTask
  )
  .delete(deleteTask);

export default router;
