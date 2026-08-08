import { Router, Request, Response } from 'express';
import { loadCurriculum, getCandidateById, addCandidate } from '../utils/curriculumLoader';
import { getSession } from '../services/InterviewSessionStore';
import { fetchCandidatesSupabase, fetchCandidateByIdSupabase, saveCandidateSupabase } from '../services/SupabaseService';

const router = Router();

// GET /api/candidates
router.get('/candidates', async (_req: Request, res: Response) => {
  try {
    const candidates = await fetchCandidatesSupabase();
    res.json({ candidates });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load candidates' });
  }
});

// POST /api/candidates
router.post('/candidates', async (req: Request, res: Response) => {
  try {
    const { name, email, jobRole, yearsExperience, education, preset } = req.body;
    if (!name || !jobRole) {
      res.status(400).json({ error: 'Name and Job Role are required' });
      return;
    }

    const candidate = addCandidate({
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      jobRole,
      yearsExperience: Number(yearsExperience) || 2,
      education: education || 'Bachelor Degree',
      preset: preset || 'intermediate',
    });

    await saveCandidateSupabase(candidate);

    res.status(201).json(candidate);
  } catch (err) {
    console.error('Failed to add candidate:', err);
    res.status(500).json({ error: 'Failed to add candidate' });
  }
});

// GET /api/candidate/:id
router.get('/candidate/:id', async (req: Request, res: Response) => {
  try {
    const candidate = await fetchCandidateByIdSupabase(req.params.id);
    if (!candidate) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load candidate' });
  }
});

// GET /api/curriculum
router.get('/curriculum', (_req: Request, res: Response) => {
  try {
    const curriculum = loadCurriculum();
    res.json(curriculum);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load curriculum' });
  }
});

// GET /api/interview/:sessionId
router.get('/interview/:sessionId', (req: Request, res: Response) => {
  const session = getSession(req.params.sessionId);
  if (!session) {
    res.status(404).json({ error: 'Interview session not found' });
    return;
  }
  res.json({
    sessionId: session.sessionId,
    candidateId: session.candidateId,
    questionCount: session.questionCount,
    topicsCovered: session.topicsCovered,
    curriculumDaysCovered: session.curriculumDaysCovered,
    difficulty: session.difficulty,
    status: session.status,
    startedAt: session.startedAt,
  });
});

export default router;
