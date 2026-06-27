import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { TaskForm } from '@/components/task-form';
import { getApiBaseUrl } from '@/lib/env';

interface EditTaskPageProps {
  params: Promise<{ id: string }> | { id: string }
}

export default async function EditTaskPage(props: EditTaskPageProps) {
  // Fix for Next.js 15+: await auth() before using
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Await params for Next.js 15+ compatibility
  const resolvedParams = typeof props.params.then === 'function' ? await props.params : props.params;

  // Fetch the task from the API
  let task = null;
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/user-tasks/${resolvedParams.id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (res.ok) {
      task = await res.json();
    }
  } catch (e) {
    // ignore
  }

  if (!task) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">Edit Task</h1>
            <p className="mt-2 text-sm text-gray-500">Update the task details below.</p>
          </div>
          <TaskForm mode="edit" task={task} />
        </div>
      </div>
    </div>
  );
}