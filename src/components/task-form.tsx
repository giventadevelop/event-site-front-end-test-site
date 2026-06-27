'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TaskFormProps {
  task?: {
    id: string
    title: string
    description?: string | null
    status: string
    priority: string
    dueDate?: Date | null
    createdAt: string
    updatedAt: string
    userId: string
    completed: boolean
  }
  mode?: 'create' | 'edit'
}

export function TaskForm({ task, mode = 'create' }: TaskFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dueDateError, setDueDateError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setDueDateError(null)

    try {
      const formData = new FormData(event.currentTarget)
      const dueDateValue = formData.get('dueDate') as string
      const today = new Date()
      const dueDateObj = dueDateValue ? new Date(dueDateValue) : null
      if (!dueDateValue) {
        setDueDateError('Due date is required.')
        setIsSubmitting(false)
        return
      }
      if (!dueDateObj || dueDateObj <= today) {
        setDueDateError('Due date must be in the future.')
        setIsSubmitting(false)
        return
      }
      const dueDateIso = new Date(dueDateValue + 'T00:00:00Z').toISOString();
      const payload: any = {
        title: formData.get('title'),
        description: formData.get('description'),
        status: formData.get('status'),
        priority: formData.get('priority'),
        dueDate: dueDateIso,
      }
      // Import server actions
      const { createTaskServer, updateTaskServer } = await import('../app/tasks/ApiServerActions');

      let result = null;
      if (mode === 'edit' && task?.id) {
        result = await updateTaskServer(task.id, {
          title: payload.title,
          description: payload.description,
          status: payload.status,
          priority: payload.priority,
          dueDate: payload.dueDate,
          completed: typeof task.completed === 'boolean' ? task.completed : payload.status === 'completed',
        });
      } else {
        result = await createTaskServer({
          ...payload,
          completed: false,
        });
      }

      if (!result) {
        throw new Error('Failed to save task');
      }
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to save task:', error)
      alert('Failed to save task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={task?.title}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={task?.description ?? ''}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={task?.status ?? 'pending'}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={task?.priority ?? 'medium'}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          defaultValue={task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {dueDateError && <p className="text-red-600 text-sm mt-1">{dueDateError}</p>}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-[#39E079] px-4 py-2 text-sm font-medium text-[#141414] hover:bg-[#32c96d] focus:outline-none focus:ring-2 focus:ring-[#39E079] focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Update Task'}
        </button>
      </div>
    </form>
  )
}