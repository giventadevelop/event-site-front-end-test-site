'use client';

import { useState } from 'react';
import { PollVotingCard } from '@/components/polls/PollVotingCard';
import { RealTimePollResults } from '@/components/polls/RealTimePollResults';
import { PollComments } from '@/components/polls/PollComments';
import { PollStatusIndicator } from '@/components/polls/PollStatusIndicator';
import { PollAnalyticsDashboard } from '@/components/polls/PollAnalyticsDashboard';
import type { EventPollDTO, EventPollOptionDTO } from '@/types';

interface PollDetailsPageProps {
  poll: EventPollDTO;
  options: EventPollOptionDTO[];
  userId?: number;
}

export function PollDetailsPage({ poll, options, userId }: PollDetailsPageProps) {
  const [activeTab, setActiveTab] = useState('vote');

  const handleVoteSubmitted = () => {
    // Vote submitted - user can manually refresh results if needed
    console.log('Vote submitted successfully');
  };

  const handleCommentAdded = () => {
    // Comment added - user can manually refresh if needed
    console.log('Comment added successfully');
  };

  const isPollActive = () => {
    const now = new Date();
    const startDate = new Date(poll.startDate);
    const endDate = poll.endDate ? new Date(poll.endDate) : null;

    return poll.isActive && now >= startDate && (!endDate || now <= endDate);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" style={{ paddingTop: '120px' }}>
        {/* Page Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-0 sm:gap-3 transition-all duration-300 hover:scale-105 px-6 mb-4"
            title="Back to Polls"
            aria-label="Back to Polls"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
            <span className="font-semibold text-indigo-700 hidden sm:inline">Back to Polls</span>
          </button>
          
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
            {poll.title}
          </h1>
          {poll.description && (
            <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left mb-4">
              {poll.description}
            </p>
          )}
          <PollStatusIndicator poll={poll} showCountdown showDetails />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-4">
            <button
              onClick={() => setActiveTab('vote')}
              className={`py-3 px-4 border-b-2 font-semibold text-base flex items-center gap-3 rounded-t-lg transition-all duration-300 ${
                activeTab === 'vote'
                  ? 'bg-blue-100 text-blue-600 border-blue-500'
                  : 'bg-blue-50 text-blue-400 border-transparent hover:bg-blue-100 hover:text-blue-500'
              }`}
              title="Vote"
              aria-label="Vote"
              type="button"
            >
              <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                activeTab === 'vote' ? 'bg-blue-100' : 'bg-blue-50'
              }`}>
                <svg className={`w-10 h-10 ${activeTab === 'vote' ? 'text-blue-500' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className={activeTab === 'vote' ? 'text-blue-700' : 'text-blue-500'}>Vote</span>
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`py-3 px-4 border-b-2 font-semibold text-base flex items-center gap-3 rounded-t-lg transition-all duration-300 ${
                activeTab === 'results'
                  ? 'bg-green-100 text-green-600 border-green-500'
                  : 'bg-green-50 text-green-400 border-transparent hover:bg-green-100 hover:text-green-500'
              }`}
              title="Results"
              aria-label="Results"
              type="button"
            >
              <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                activeTab === 'results' ? 'bg-green-100' : 'bg-green-50'
              }`}>
                <svg className={`w-10 h-10 ${activeTab === 'results' ? 'text-green-500' : 'text-green-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className={activeTab === 'results' ? 'text-green-700' : 'text-green-500'}>Results</span>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-3 px-4 border-b-2 font-semibold text-base flex items-center gap-3 rounded-t-lg transition-all duration-300 ${
                activeTab === 'comments'
                  ? 'bg-purple-100 text-purple-600 border-purple-500'
                  : 'bg-purple-50 text-purple-400 border-transparent hover:bg-purple-100 hover:text-purple-500'
              }`}
              title="Comments"
              aria-label="Comments"
              type="button"
            >
              <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                activeTab === 'comments' ? 'bg-purple-100' : 'bg-purple-50'
              }`}>
                <svg className={`w-10 h-10 ${activeTab === 'comments' ? 'text-purple-500' : 'text-purple-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className={activeTab === 'comments' ? 'text-purple-700' : 'text-purple-500'}>Comments</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 px-4 border-b-2 font-semibold text-base flex items-center gap-3 rounded-t-lg transition-all duration-300 ${
                activeTab === 'analytics'
                  ? 'bg-orange-100 text-orange-600 border-orange-500'
                  : 'bg-orange-50 text-orange-400 border-transparent hover:bg-orange-100 hover:text-orange-500'
              }`}
              title="Analytics"
              aria-label="Analytics"
              type="button"
            >
              <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                activeTab === 'analytics' ? 'bg-orange-100' : 'bg-orange-50'
              }`}>
                <svg className={`w-10 h-10 ${activeTab === 'analytics' ? 'text-orange-500' : 'text-orange-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className={activeTab === 'analytics' ? 'text-orange-700' : 'text-orange-500'}>Analytics</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">

          {/* Vote Tab */}
          {activeTab === 'vote' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <PollVotingCard
                poll={poll}
                options={options}
                userId={userId}
                onVoteSubmitted={handleVoteSubmitted}
              />
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <RealTimePollResults
                poll={poll}
                options={options}
              />
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <PollComments
                poll={poll}
                userId={userId}
                onCommentAdded={handleCommentAdded}
              />
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <PollAnalyticsDashboard
                poll={poll}
                options={options}
              />
            </div>
          )}
        </div>

        {/* Poll Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Poll Information</h3>
          <p className="text-sm text-gray-600 mb-6">Details about this poll</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Start Date:</span>
              <p className="text-gray-600">
                {new Date(poll.startDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            
            {poll.endDate && (
              <div>
                <span className="font-medium text-gray-900">End Date:</span>
                <p className="text-gray-600">
                  {new Date(poll.endDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}

            <div>
              <span className="font-medium text-gray-900">Max Responses:</span>
              <p className="text-gray-600">{poll.maxResponsesPerUser || 1} per user</p>
            </div>

            <div>
              <span className="font-medium text-gray-900">Multiple Choice:</span>
              <p className="text-gray-600">{poll.allowMultipleChoices ? 'Yes' : 'No'}</p>
            </div>

            <div>
              <span className="font-medium text-gray-900">Anonymous:</span>
              <p className="text-gray-600">{poll.isAnonymous ? 'Yes' : 'No'}</p>
            </div>

            <div>
              <span className="font-medium text-gray-900">Results Visible:</span>
              <p className="text-gray-600">{poll.resultsVisibleTo || 'All'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





