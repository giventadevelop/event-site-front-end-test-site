import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import { PollDetailsPage } from './PollDetailsPage';
import { fetchEventPollServer, fetchEventPollOptionsServer } from '@/app/admin/polls/ApiServerActions';
import { fetchUserProfileServer } from '@/app/profile/ApiServerActions';
import type { EventPollDTO, EventPollOptionDTO } from '@/types';

interface PollPageProps {
  params: {
    id: string;
  };
}

export default async function PollPage({ params }: PollPageProps) {
  // Await params if it's a promise (Next.js 15+)
  const resolvedParams = typeof params.then === 'function' ? await params : params;
  
  const { userId } = await auth();
  
  // Get user profile if logged in
  let userProfile = null;
  if (userId) {
    try {
      userProfile = await fetchUserProfileServer(userId);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }

  // Fetch poll data
  let poll: EventPollDTO | null = null;
  let options: EventPollOptionDTO[] = [];

  try {
    const pollId = parseInt(resolvedParams.id);
    if (isNaN(pollId)) {
      notFound();
    }

    poll = await fetchEventPollServer(pollId);
    if (!poll) {
      notFound();
    }

    options = await fetchEventPollOptionsServer({
      'pollId.equals': pollId,
      'isActive.equals': true
    });
  } catch (error) {
    console.error('Error fetching poll data:', error);
    notFound();
  }

  return (
    <PollDetailsPage 
      poll={poll} 
      options={options} 
      userId={userProfile?.id}
    />
  );
}



