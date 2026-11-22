import express from 'express';
import { getProjectAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(protect);

router.get('/', getProjectAnalytics);
router.get('/:projectId/analytics', getProjectAnalytics);

export default router;
