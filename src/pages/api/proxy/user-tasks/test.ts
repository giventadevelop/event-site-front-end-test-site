import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    res.status(200).json({ message: 'Test route works!' });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[PROXY user-tasks/test]', message);
    res.status(500).json({ error: 'Test route error', code: 'PROXY_ERROR', message });
  }
}