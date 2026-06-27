import { UserTaskDTO, UserSubscriptionDTO } from '@/types';
import { getAppUrlFromRequestHeaders } from '@/lib/env';

export async function deleteTaskServer(taskId: string): Promise<boolean> {
  const baseUrl = await getAppUrlFromRequestHeaders();

  try {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: taskId }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}

export async function checkSubscriptionStatusServer(userProfileId: number): Promise<UserSubscriptionDTO | null> {
  const baseUrl = await getAppUrlFromRequestHeaders();

  try {
    const response = await fetch(
      `${baseUrl}/api/proxy/user-subscriptions/by-profile/${userProfileId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      }
    );

    if (response.ok) {
      const subscriptions = await response.json();
      return Array.isArray(subscriptions) ? subscriptions[0] : subscriptions;
    }
    return null;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return null;
  }
}