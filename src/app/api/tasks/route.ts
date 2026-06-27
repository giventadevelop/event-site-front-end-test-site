import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import type { UserTaskDTO } from '@/types';
import { getAppUrl } from '@/lib/env';

// Force Node.js runtime
export const runtime = 'nodejs';

// Validation schema for task creation and update
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().refine(
    (val) => {
      if (!val) return false;
      const isoDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;
      const isoDate = /^\d{4}-\d{2}-\d{2}$/;
      return isoDateTime.test(val) || isoDate.test(val);
    },
    { message: 'Invalid date or datetime format' }
  ),
  status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
  eventId: z.number().optional(),
  assigneeName: z.string().max(255).optional(),
  assigneeContactPhone: z.string().max(50).optional(),
  assigneeContactEmail: z.string().max(255).optional(),
});
const updateTaskSchema = createTaskSchema.partial();

async function getUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

function applyFilters(tasks: UserTaskDTO[], searchParams: URLSearchParams): UserTaskDTO[] {
  // Helper to parse array params
  const parseArray = (param: string | null) => param ? param.split(',') : undefined;
  // Helper to parse boolean
  const parseBool = (param: string | null) => param === 'true' ? true : param === 'false' ? false : undefined;

  return tasks.filter(task => {
    // ID filters
    const id = task.id;
    if (searchParams.get('id.greaterThan') && !(id > Number(searchParams.get('id.greaterThan')))) return false;
    if (searchParams.get('id.lessThan') && !(id < Number(searchParams.get('id.lessThan')))) return false;
    if (searchParams.get('id.greaterThanOrEqual') && !(id >= Number(searchParams.get('id.greaterThanOrEqual')))) return false;
    if (searchParams.get('id.lessThanOrEqual') && !(id <= Number(searchParams.get('id.lessThanOrEqual')))) return false;
    if (searchParams.get('id.equals') && id !== Number(searchParams.get('id.equals'))) return false;
    if (searchParams.get('id.notEquals') && id === Number(searchParams.get('id.notEquals'))) return false;
    if (searchParams.get('id.in')) {
      const arr = parseArray(searchParams.get('id.in'))?.map(Number);
      if (arr && !arr.includes(id)) return false;
    }
    if (searchParams.get('id.notIn')) {
      const arr = parseArray(searchParams.get('id.notIn'))?.map(Number);
      if (arr && arr.includes(id)) return false;
    }
    if (searchParams.get('id.specified')) {
      const specified = parseBool(searchParams.get('id.specified'));
      if (specified !== undefined && specified !== (id !== undefined && id !== null)) return false;
    }
    // Title filters
    if (searchParams.get('title.contains') && !task.title.includes(searchParams.get('title.contains')!)) return false;
    if (searchParams.get('title.doesNotContain') && task.title.includes(searchParams.get('title.doesNotContain')!)) return false;
    if (searchParams.get('title.equals') && task.title !== searchParams.get('title.equals')) return false;
    if (searchParams.get('title.notEquals') && task.title === searchParams.get('title.notEquals')) return false;
    if (searchParams.get('title.in')) {
      const arr = parseArray(searchParams.get('title.in'));
      if (arr && !arr.includes(task.title)) return false;
    }
    if (searchParams.get('title.notIn')) {
      const arr = parseArray(searchParams.get('title.notIn'));
      if (arr && arr.includes(task.title)) return false;
    }
    if (searchParams.get('title.specified')) {
      const specified = parseBool(searchParams.get('title.specified'));
      if (specified !== undefined && specified !== (task.title !== undefined && task.title !== null)) return false;
    }
    // Description filters
    if (searchParams.get('description.contains') && !task.description?.includes(searchParams.get('description.contains')!)) return false;
    if (searchParams.get('description.doesNotContain') && task.description?.includes(searchParams.get('description.doesNotContain')!)) return false;
    if (searchParams.get('description.equals') && task.description !== searchParams.get('description.equals')) return false;
    if (searchParams.get('description.notEquals') && task.description === searchParams.get('description.notEquals')) return false;
    if (searchParams.get('description.in')) {
      const arr = parseArray(searchParams.get('description.in'));
      if (arr && !arr.includes(task.description || '')) return false;
    }
    if (searchParams.get('description.notIn')) {
      const arr = parseArray(searchParams.get('description.notIn'));
      if (arr && arr.includes(task.description || '')) return false;
    }
    if (searchParams.get('description.specified')) {
      const specified = parseBool(searchParams.get('description.specified'));
      if (specified !== undefined && specified !== (task.description !== undefined && task.description !== null)) return false;
    }
    // Status filters
    if (searchParams.get('status.contains') && !task.status.includes(searchParams.get('status.contains')!)) return false;
    if (searchParams.get('status.doesNotContain') && task.status.includes(searchParams.get('status.doesNotContain')!)) return false;
    if (searchParams.get('status.equals') && task.status !== searchParams.get('status.equals')) return false;
    if (searchParams.get('status.notEquals') && task.status === searchParams.get('status.notEquals')) return false;
    if (searchParams.get('status.in')) {
      const arr = parseArray(searchParams.get('status.in'));
      if (arr && !arr.includes(task.status)) return false;
    }
    if (searchParams.get('status.notIn')) {
      const arr = parseArray(searchParams.get('status.notIn'));
      if (arr && arr.includes(task.status)) return false;
    }
    if (searchParams.get('status.specified')) {
      const specified = parseBool(searchParams.get('status.specified'));
      if (specified !== undefined && specified !== (task.status !== undefined && task.status !== null)) return false;
    }
    // Priority filters
    if (searchParams.get('priority.contains') && !task.priority.includes(searchParams.get('priority.contains')!)) return false;
    if (searchParams.get('priority.doesNotContain') && task.priority.includes(searchParams.get('priority.doesNotContain')!)) return false;
    if (searchParams.get('priority.equals') && task.priority !== searchParams.get('priority.equals')) return false;
    if (searchParams.get('priority.notEquals') && task.priority === searchParams.get('priority.notEquals')) return false;
    if (searchParams.get('priority.in')) {
      const arr = parseArray(searchParams.get('priority.in'));
      if (arr && !arr.includes(task.priority)) return false;
    }
    if (searchParams.get('priority.notIn')) {
      const arr = parseArray(searchParams.get('priority.notIn'));
      if (arr && arr.includes(task.priority)) return false;
    }
    if (searchParams.get('priority.specified')) {
      const specified = parseBool(searchParams.get('priority.specified'));
      if (specified !== undefined && specified !== (task.priority !== undefined && task.priority !== null)) return false;
    }
    // DueDate filters
    if (searchParams.get('dueDate.greaterThan') && !(task.dueDate && task.dueDate > searchParams.get('dueDate.greaterThan')!)) return false;
    if (searchParams.get('dueDate.lessThan') && !(task.dueDate && task.dueDate < searchParams.get('dueDate.lessThan')!)) return false;
    if (searchParams.get('dueDate.greaterThanOrEqual') && !(task.dueDate && task.dueDate >= searchParams.get('dueDate.greaterThanOrEqual')!)) return false;
    if (searchParams.get('dueDate.lessThanOrEqual') && !(task.dueDate && task.dueDate <= searchParams.get('dueDate.lessThanOrEqual')!)) return false;
    if (searchParams.get('dueDate.equals') && task.dueDate !== searchParams.get('dueDate.equals')) return false;
    if (searchParams.get('dueDate.notEquals') && task.dueDate === searchParams.get('dueDate.notEquals')) return false;
    if (searchParams.get('dueDate.in')) {
      const arr = parseArray(searchParams.get('dueDate.in'));
      if (arr && !arr.includes(task.dueDate || '')) return false;
    }
    if (searchParams.get('dueDate.notIn')) {
      const arr = parseArray(searchParams.get('dueDate.notIn'));
      if (arr && arr.includes(task.dueDate || '')) return false;
    }
    if (searchParams.get('dueDate.specified')) {
      const specified = parseBool(searchParams.get('dueDate.specified'));
      if (specified !== undefined && specified !== (task.dueDate !== undefined && task.dueDate !== null)) return false;
    }
    // Completed filters
    if (searchParams.get('completed.equals')) {
      const val = parseBool(searchParams.get('completed.equals'));
      if (val !== undefined && task.completed !== val) return false;
    }
    if (searchParams.get('completed.notEquals')) {
      const val = parseBool(searchParams.get('completed.notEquals'));
      if (val !== undefined && task.completed === val) return false;
    }
    if (searchParams.get('completed.in')) {
      const arr = parseArray(searchParams.get('completed.in'))?.map(parseBool);
      if (arr && !arr.includes(task.completed)) return false;
    }
    if (searchParams.get('completed.notIn')) {
      const arr = parseArray(searchParams.get('completed.notIn'))?.map(parseBool);
      if (arr && arr.includes(task.completed)) return false;
    }
    if (searchParams.get('completed.specified')) {
      const specified = parseBool(searchParams.get('completed.specified'));
      if (specified !== undefined && specified !== (task.completed !== undefined && task.completed !== null)) return false;
    }
    // userId filters
    if (searchParams.get('userId.equals') && task.userId !== Number(searchParams.get('userId.equals'))) return false;
    if (searchParams.get('userId.notEquals') && task.userId === Number(searchParams.get('userId.notEquals'))) return false;
    if (searchParams.get('userId.in')) {
      const arr = parseArray(searchParams.get('userId.in'))?.map(Number);
      if (arr && !arr.includes(task.userId)) return false;
    }
    if (searchParams.get('userId.notIn')) {
      const arr = parseArray(searchParams.get('userId.notIn'))?.map(Number);
      if (arr && arr.includes(task.userId)) return false;
    }
    if (searchParams.get('userId.specified')) {
      const specified = parseBool(searchParams.get('userId.specified'));
      if (specified !== undefined && specified !== (task.userId !== undefined && task.userId !== null)) return false;
    }
    // createdAt/updatedAt filters (compare as strings)
    if (searchParams.get('createdAt.greaterThan') && !(task.createdAt > searchParams.get('createdAt.greaterThan')!)) return false;
    if (searchParams.get('createdAt.lessThan') && !(task.createdAt < searchParams.get('createdAt.lessThan')!)) return false;
    if (searchParams.get('createdAt.greaterThanOrEqual') && !(task.createdAt >= searchParams.get('createdAt.greaterThanOrEqual')!)) return false;
    if (searchParams.get('createdAt.lessThanOrEqual') && !(task.createdAt <= searchParams.get('createdAt.lessThanOrEqual')!)) return false;
    if (searchParams.get('createdAt.equals') && task.createdAt !== searchParams.get('createdAt.equals')) return false;
    if (searchParams.get('createdAt.notEquals') && task.createdAt === searchParams.get('createdAt.notEquals')) return false;
    if (searchParams.get('createdAt.in')) {
      const arr = parseArray(searchParams.get('createdAt.in'));
      if (arr && !arr.includes(task.createdAt)) return false;
    }
    if (searchParams.get('createdAt.notIn')) {
      const arr = parseArray(searchParams.get('createdAt.notIn'));
      if (arr && arr.includes(task.createdAt)) return false;
    }
    if (searchParams.get('createdAt.specified')) {
      const specified = parseBool(searchParams.get('createdAt.specified'));
      if (specified !== undefined && specified !== (task.createdAt !== undefined && task.createdAt !== null)) return false;
    }
    if (searchParams.get('updatedAt.greaterThan') && !(task.updatedAt > searchParams.get('updatedAt.greaterThan')!)) return false;
    if (searchParams.get('updatedAt.lessThan') && !(task.updatedAt < searchParams.get('updatedAt.lessThan')!)) return false;
    if (searchParams.get('updatedAt.greaterThanOrEqual') && !(task.updatedAt >= searchParams.get('updatedAt.greaterThanOrEqual')!)) return false;
    if (searchParams.get('updatedAt.lessThanOrEqual') && !(task.updatedAt <= searchParams.get('updatedAt.lessThanOrEqual')!)) return false;
    if (searchParams.get('updatedAt.equals') && task.updatedAt !== searchParams.get('updatedAt.equals')) return false;
    if (searchParams.get('updatedAt.notEquals') && task.updatedAt === searchParams.get('updatedAt.notEquals')) return false;
    if (searchParams.get('updatedAt.in')) {
      const arr = parseArray(searchParams.get('updatedAt.in'));
      if (arr && !arr.includes(task.updatedAt)) return false;
    }
    if (searchParams.get('updatedAt.notIn')) {
      const arr = parseArray(searchParams.get('updatedAt.notIn'));
      if (arr && arr.includes(task.updatedAt)) return false;
    }
    if (searchParams.get('updatedAt.specified')) {
      const specified = parseBool(searchParams.get('updatedAt.specified'));
      if (specified !== undefined && specified !== (task.updatedAt !== undefined && task.updatedAt !== null)) return false;
    }
    return true;
  });
}

export async function GET(request: NextRequest, context?: { params?: { id?: string } }) {
  const API_BASE_URL = getAppUrl();
  if (!API_BASE_URL) {
    return NextResponse.json({ error: 'API base URL not configured' }, { status: 503 });
  }
  try {
    const userId = await getUserId();
    // If context and params.id is present, fetch a single task
    if (context && context.params && context.params.id) {
      const response = await fetch(`${API_BASE_URL}/api/proxy/user-tasks/${context.params.id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }
    // Otherwise, fetch all tasks (existing logic)
    const url = new URL(`${API_BASE_URL}/api/proxy/user-tasks`);
    for (const [key, value] of new URL(request.url).searchParams.entries()) {
      url.searchParams.append(key, value);
    }
    if (!url.searchParams.has('userId.equals')) {
      url.searchParams.append('userId.equals', userId);
    }
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error proxying GET user-tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const API_BASE_URL = getAppUrl();
  if (!API_BASE_URL) {
    return NextResponse.json({ error: 'API base URL not configured' }, { status: 503 });
  }
  try {
    const userId = await getUserId();
    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);
    const now = new Date().toISOString();
    // Default eventId to 1 if null or undefined
    const eventId = validatedData.eventId == null ? 1 : validatedData.eventId;
    // Build full UserTaskDTO (omit id for POST)
    const payload: Partial<UserTaskDTO> = {
      // id: not included for POST
      title: validatedData.title,
      description: validatedData.description ?? '',
      status: validatedData.status,
      priority: validatedData.priority,
      dueDate: validatedData.dueDate,
      completed: validatedData.status === 'completed',
      userId: Number(userId),
      eventId,
      assigneeName: validatedData.assigneeName,
      assigneeContactPhone: validatedData.assigneeContactPhone,
      assigneeContactEmail: validatedData.assigneeContactEmail,
      createdAt: now,
      updatedAt: now,
    };
    const response = await fetch(`${API_BASE_URL}/api/proxy/user-tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error proxying POST user-tasks:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const API_BASE_URL = getAppUrl();
  if (!API_BASE_URL) {
    return NextResponse.json({ error: 'API base URL not configured' }, { status: 503 });
  }
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) {
      return NextResponse.json({ error: 'Task id is required' }, { status: 400 });
    }
    // Fetch the existing task to get all required fields
    const existingRes = await fetch(`${API_BASE_URL}/api/proxy/user-tasks/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!existingRes.ok) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    const existingTask = await existingRes.json();
    const now = new Date().toISOString();
    let dueDateValue = updateData.dueDate;
    if (dueDateValue === null || dueDateValue === undefined || dueDateValue === '') {
      dueDateValue = existingTask.dueDate ?? null;
    }
    if (dueDateValue === '') {
      dueDateValue = null;
    } else if (dueDateValue !== null && dueDateValue !== undefined) {
      dueDateValue = String(dueDateValue);
    }
    // Default eventId to 1 if null or undefined
    const eventId = updateData.eventId == null ? 1 : updateData.eventId;
    // Build full UserTaskDTO for PUT
    const merged: UserTaskDTO = {
      id: existingTask.id,
      title: updateData.title ?? existingTask.title,
      description: updateData.description ?? existingTask.description ?? '',
      status: updateData.status ?? existingTask.status,
      priority: updateData.priority ?? existingTask.priority,
      dueDate: dueDateValue,
      createdAt: existingTask.createdAt,
      updatedAt: now,
      userId: existingTask.userId ?? Number(userId),
      completed: (updateData.status ? updateData.status === 'completed' : existingTask.completed) ?? false,
      eventId,
      assigneeName: updateData.assigneeName ?? existingTask.assigneeName,
      assigneeContactPhone: updateData.assigneeContactPhone ?? existingTask.assigneeContactPhone,
      assigneeContactEmail: updateData.assigneeContactEmail ?? existingTask.assigneeContactEmail,
      user: existingTask.user,
      event: existingTask.event,
    };
    // Validate the merged payload
    const validatedUpdate = updateTaskSchema.parse(merged);
    const response = await fetch(`${API_BASE_URL}/api/proxy/user-tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged),
    });
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error proxying PUT user-tasks:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const API_BASE_URL = getAppUrl();
  if (!API_BASE_URL) {
    return NextResponse.json({ error: 'API base URL not configured' }, { status: 503 });
  }
  try {
    const userId = await getUserId();
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Task id is required' }, { status: 400 });
    }
    // Ensure id is a string for the URL
    const idStr = String(id);
    const response = await fetch(`${API_BASE_URL}/api/proxy/user-tasks/${idStr}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: Number(userId) }),
    });
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error proxying DELETE user-tasks:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}