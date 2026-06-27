import { auth } from '@clerk/nextjs/server';
import { TaskForm } from '@/components/task-form';

export default async function NewTaskPage() {
  // Fix for Next.js 15+: await auth() before using
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">Create New Task</h1>
            <p className="mt-2 text-sm text-gray-500">Fill in the details below to create a new task.</p>
          </div>
          <TaskForm mode="create" />
        </div>
      </div>
    </div>
  );
}