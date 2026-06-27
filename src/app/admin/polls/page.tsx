import { redirect } from 'next/navigation';
import { safeAuth } from '@/lib/safe-auth';
import { PollManagementClient } from './PollManagementClient';
import { fetchEventPollsServer } from './ApiServerActions';

export default async function PollsPage() {
  const { userId } = await safeAuth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Fetch polls data - API now returns { data, totalCount }
  const pollsResult = await fetchEventPollsServer();
  const polls = pollsResult.data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Header Section with Gradient */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-6 h-3 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full"></div>
            <p className="text-gray-600 font-medium">Admin Panel</p>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight tracking-tight text-gray-900 mb-6">
            Poll{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent font-medium">
              Management
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Create and manage interactive polls for your events
          </p>
        </div>
        
        <PollManagementClient initialPolls={polls} />
      </div>
    </div>
  );
}

