import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Validation schema for task updates
const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100).optional(),
  description: z.string().max(500).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      console.error('Database error:', error);
      return Response.json(
        { error: 'Database operation failed' },
        { status: 500 }
      );
    }

    console.error('Error fetching task:', error);
    return Response.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = updateTaskSchema.parse(body);

    // Update task
    return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof PrismaClientKnownRequestError) {
      if ((error as any).code === 'P2025') {
        return Response.json(
          { error: 'Task not found or unauthorized' },
          { status: 404 }
        );
      }

      console.error('Database error:', error);
      return Response.json(
        { error: 'Database operation failed' },
        { status: 500 }
      );
    }

    console.error('Error updating task:', error);
    return Response.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if ((error as any).code === 'P2025') {
        return Response.json(
          { error: 'Task not found or unauthorized' },
          { status: 404 }
        );
      }

      console.error('Database error:', error);
      return Response.json(
        { error: 'Database operation failed' },
        { status: 500 }
      );
    }

    console.error('Error deleting task:', error);
    return Response.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}