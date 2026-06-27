import { startPollScheduler } from './pollScheduler';

// Initialize poll scheduler when the module is imported
if (typeof window === 'undefined') {
  // Only run on server side
  startPollScheduler().catch(console.error);
}

export { startPollScheduler, stopPollScheduler } from './pollScheduler';





