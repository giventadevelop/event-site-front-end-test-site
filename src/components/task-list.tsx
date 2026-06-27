'use client'

import { useRouter } from 'next/navigation'

interface Task {
  id: string
  title: string
  description?: string | null
  status: string
  priority: string
  dueDate?: Date | null
  completed: boolean
  createdAt: Date
}

interface TaskListProps {
  tasks: Task[]
}

export function TaskList({ tasks }: TaskListProps) {
  const router = useRouter()

  async function handleDelete(taskId: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      await Promise.resolve();
      router.push('/dashboard')
    }
  }

  async function handleToggleCompletion(taskId: string) {
    await Promise.resolve();
    router.push('/dashboard')
  }

  function getPriorityColor(priority: string) {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50'
      case 'low':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'in_progress':
        return 'text-blue-600 bg-blue-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (tasks.length === 0) {
    return (
      <tr>
        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
          No tasks found. Create your first task!
        </td>
      </tr>
    )
  }

  return (
    <>
      {tasks.map((task) => (
        <tr key={task.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleCompletion(task.id)}
                className="h-4 w-4 rounded border-gray-300 text-[#39E079] focus:ring-[#39E079]"
              />
              <span
                className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                  task.status
                )}`}
              >
                {task.status}
              </span>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex flex-col">
              <span
                className={`text-sm font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'
                  }`}
              >
                {task.title}
              </span>
              {task.description && (
                <span className="mt-1 text-xs text-gray-500">{task.description}</span>
              )}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(
                task.priority
              )}`}
            >
              {task.priority}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {task.dueDate ? formatDate(task.dueDate) : '-'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => router.push(`/tasks/${task.id}/edit`)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}