import { Router } from 'express';
import { handleInterview } from '../controllers/InterviewController';

const router = Router();

// POST /api/interview — handles both session start and conversation turns
router.post('/', handleInterview);

export default router;
