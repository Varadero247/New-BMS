import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
const router = Router();

const analyzeSchema = z.object({
  text: z.string().min(1, 'Text is required'),
});

router.post('/analyze', authenticate, async (req: Request, res: Response) => { try { const parsed = analyzeSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const { text } = parsed.data; const extracted = { parties: [], dates: [], values: [], keyTerms: [] }; res.json({ success: true, data: { extracted, aiNote: 'AI extraction placeholder — connect to AI service for production' } }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'EXTRACT_ERROR', message: error.message } }); } });
export default router;
