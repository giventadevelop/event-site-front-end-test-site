import { cn } from '@/lib/utils'
import Link from 'next/link'

interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

export function TopNav({ children, className, ...props }: TopNavProps) {
  return (
    <nav
      className={cn(
        'flex h-16 items-center border-b bg-white px-6',
        className
      )}
      {...props}
    >
      <Link
        href="/"
        className="flex items-center gap-2 font-semibold hover:opacity-80"
      >
        <span className="text-xl">📋</span>
        <span className="text-xl font-bold text-gray-900">TaskMngr</span>
      </Link>

      <div className="ml-auto flex items-center space-x-4">
        <Link
          href="/tasks"
          className="text-gray-700 font-medium hover:text-gray-900"
        >
          Tasks
        </Link>
        {children}
      </div>
    </nav>
  )
}