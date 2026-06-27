import { fetchEventPollsServer, updateEventPollServer } from '@/app/admin/polls/ApiServerActions';
import type { EventPollDTO } from '@/types';

interface PollSchedulerOptions {
  checkInterval?: number; // in milliseconds, default 60000 (1 minute)
  onPollActivated?: (poll: EventPollDTO) => void;
  onPollDeactivated?: (poll: EventPollDTO) => void;
}

export class PollScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private options: PollSchedulerOptions;

  constructor(options: PollSchedulerOptions = {}) {
    this.options = {
      checkInterval: 60000, // 1 minute
      ...options,
    };
  }

  start() {
    if (this.intervalId) {
      console.log('Poll scheduler is already running');
      return;
    }

    console.log('Starting poll scheduler...');
    this.intervalId = setInterval(() => {
      this.checkAndUpdatePolls();
    }, this.options.checkInterval);

    // Run immediately on start
    this.checkAndUpdatePolls();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Poll scheduler stopped');
    }
  }

  private async checkAndUpdatePolls() {
    try {
      console.log('Checking polls for activation/deactivation...');
      
      // Fetch all polls - API now returns { data, totalCount }
      const pollsResult = await fetchEventPollsServer({
        'isActive.equals': true, // Only check active polls
      });
      const polls = pollsResult.data;

      const now = new Date();
      const updates: Promise<void>[] = [];

      for (const poll of polls) {
        const startDate = new Date(poll.startDate);
        const endDate = poll.endDate ? new Date(poll.endDate) : null;

        // Check if poll should be activated
        if (now >= startDate && poll.isActive === false) {
          console.log(`Activating poll: ${poll.title} (ID: ${poll.id})`);
          updates.push(
            updateEventPollServer(poll.id!, { isActive: true })
              .then(() => {
                this.options.onPollActivated?.(poll);
                console.log(`Poll activated: ${poll.title}`);
              })
              .catch(error => {
                console.error(`Failed to activate poll ${poll.title}:`, error);
              })
          );
        }

        // Check if poll should be deactivated
        if (endDate && now > endDate && poll.isActive === true) {
          console.log(`Deactivating poll: ${poll.title} (ID: ${poll.id})`);
          updates.push(
            updateEventPollServer(poll.id!, { isActive: false })
              .then(() => {
                this.options.onPollDeactivated?.(poll);
                console.log(`Poll deactivated: ${poll.title}`);
              })
              .catch(error => {
                console.error(`Failed to deactivate poll ${poll.title}:`, error);
              })
          );
        }
      }

      // Wait for all updates to complete
      await Promise.all(updates);

      if (updates.length > 0) {
        console.log(`Processed ${updates.length} poll updates`);
      }
    } catch (error) {
      console.error('Error in poll scheduler:', error);
    }
  }

  // Manual activation/deactivation methods
  async activatePoll(pollId: number): Promise<void> {
    try {
      await updateEventPollServer(pollId, { isActive: true });
      console.log(`Manually activated poll ID: ${pollId}`);
    } catch (error) {
      console.error(`Failed to manually activate poll ${pollId}:`, error);
      throw error;
    }
  }

  async deactivatePoll(pollId: number): Promise<void> {
    try {
      await updateEventPollServer(pollId, { isActive: false });
      console.log(`Manually deactivated poll ID: ${pollId}`);
    } catch (error) {
      console.error(`Failed to manually deactivate poll ${pollId}:`, error);
      throw error;
    }
  }

  // Get polls that are scheduled to activate/deactivate soon
  async getUpcomingChanges(minutes: number = 60): Promise<{
    activating: EventPollDTO[];
    deactivating: EventPollDTO[];
  }> {
    try {
      const pollsResult = await fetchEventPollsServer();
      const polls = pollsResult.data;
      const now = new Date();
      const futureTime = new Date(now.getTime() + minutes * 60 * 1000);

      const activating: EventPollDTO[] = [];
      const deactivating: EventPollDTO[] = [];

      for (const poll of polls) {
        const startDate = new Date(poll.startDate);
        const endDate = poll.endDate ? new Date(poll.endDate) : null;

        // Check for polls that will activate soon
        if (startDate > now && startDate <= futureTime && !poll.isActive) {
          activating.push(poll);
        }

        // Check for polls that will deactivate soon
        if (endDate && endDate > now && endDate <= futureTime && poll.isActive) {
          deactivating.push(poll);
        }
      }

      return { activating, deactivating };
    } catch (error) {
      console.error('Error getting upcoming poll changes:', error);
      return { activating: [], deactivating: [] };
    }
  }

  // Check if a specific poll is currently active based on time
  isPollActive(poll: EventPollDTO): boolean {
    const now = new Date();
    const startDate = new Date(poll.startDate);
    const endDate = poll.endDate ? new Date(poll.endDate) : null;

    return poll.isActive && now >= startDate && (!endDate || now <= endDate);
  }

  // Get time until poll activates/deactivates
  getTimeUntilChange(poll: EventPollDTO): {
    type: 'activate' | 'deactivate' | 'none';
    time: number; // milliseconds
    message: string;
  } {
    const now = new Date();
    const startDate = new Date(poll.startDate);
    const endDate = poll.endDate ? new Date(poll.endDate) : null;

    // Check if poll will activate
    if (startDate > now && !poll.isActive) {
      const timeUntil = startDate.getTime() - now.getTime();
      return {
        type: 'activate',
        time: timeUntil,
        message: `Poll will activate in ${Math.ceil(timeUntil / (1000 * 60))} minutes`,
      };
    }

    // Check if poll will deactivate
    if (endDate && endDate > now && poll.isActive) {
      const timeUntil = endDate.getTime() - now.getTime();
      return {
        type: 'deactivate',
        time: timeUntil,
        message: `Poll will deactivate in ${Math.ceil(timeUntil / (1000 * 60))} minutes`,
      };
    }

    return {
      type: 'none',
      time: 0,
      message: 'No scheduled changes',
    };
  }
}

// Singleton instance
let pollSchedulerInstance: PollScheduler | null = null;

export function getPollScheduler(): PollScheduler {
  if (!pollSchedulerInstance) {
    pollSchedulerInstance = new PollScheduler({
      onPollActivated: (poll) => {
        console.log(`🎉 Poll "${poll.title}" is now active!`);
        // You can add additional logic here, like sending notifications
      },
      onPollDeactivated: (poll) => {
        console.log(`⏰ Poll "${poll.title}" has ended`);
        // You can add additional logic here, like sending notifications
      },
    });
  }
  return pollSchedulerInstance;
}

// Utility functions
export async function startPollScheduler(): Promise<void> {
  const scheduler = getPollScheduler();
  scheduler.start();
}

export async function stopPollScheduler(): Promise<void> {
  const scheduler = getPollScheduler();
  scheduler.stop();
}

export async function checkPollStatus(pollId: number): Promise<boolean> {
  try {
    const pollsResult = await fetchEventPollsServer({ 'id.equals': pollId });
    const polls = pollsResult.data;
    if (polls.length === 0) return false;
    
    const scheduler = getPollScheduler();
    return scheduler.isPollActive(polls[0]);
  } catch (error) {
    console.error('Error checking poll status:', error);
    return false;
  }
}

