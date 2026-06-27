import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { eventId, errorType } = req.query;

  console.log(`Test endpoint called with eventId: ${eventId}, errorType: ${errorType}`);

  // Simulate different error scenarios
  switch (errorType) {
    case 'timeout':
      // Simulate timeout
      await new Promise(resolve => setTimeout(resolve, 15000));
      res.status(408).json({ error: 'Request timeout' });
      break;

    case 'server-error':
      // Simulate server error
      res.status(500).json({ error: 'Internal server error' });
      break;

    case 'invalid-json':
      // Simulate invalid JSON response
      res.status(200).send('Invalid JSON response');
      break;

    case 'network-error':
      // Simulate network error
      res.status(503).json({ error: 'Service unavailable' });
      break;

    default:
      // Normal response
      res.status(200).json([
        {
          id: 1,
          fileUrl: `https://example.com/test-image-${eventId}.jpg`,
          title: `Test Image for Event ${eventId}`
        }
      ]);
  }
}