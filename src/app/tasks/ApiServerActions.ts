import { UserTaskDTO } from '@/types';
import { getAppUrl } from '@/lib/env';

export async function createTaskServer(payload: Omit<UserTaskDTO, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserTaskDTO | null> {
  const baseUrl = getAppUrl();

  try {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
}

export async function updateTaskServer(taskId: string, payload: Partial<UserTaskDTO>): Promise<UserTaskDTO | null> {
  const baseUrl = getAppUrl();

  try {
    const response = await fetch(`${baseUrl}/api/tasks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: taskId,
        ...payload,
        updatedAt: new Date().toISOString(),
      }),
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
}