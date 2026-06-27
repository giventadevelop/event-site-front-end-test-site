'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Users, Clock, MessageSquare } from 'lucide-react';
import type { EventPollDTO, EventPollOptionDTO } from '@/types';
import { fetchEventPollsServer, fetchEventPollOptionsServer } from '@/app/admin/polls/ApiServerActions';

interface PollListProps {
  eventId?: number;
  userId?: number;
  onPollSelect?: (poll: EventPollDTO, options: EventPollOptionDTO[]) => void;
}

export function PollList({ eventId, userId, onPollSelect }: PollListProps) {
  const [polls, setPolls] = useState<EventPollDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPoll, setSelectedPoll] = useState<EventPollDTO | null>(null);
  const [pollOptions, setPollOptions] = useState<EventPollOptionDTO[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const loadPolls = async () => {
      setIsLoading(true);
      try {
        const filters: Record<string, any> = {
          'isActive.equals': true,
          page: currentPage,
          size: pageSize,
          sort: 'createdAt,desc' // Latest polls first (descending order)
        };
        
        if (eventId) {
          filters['eventId.equals'] = eventId;
        }
        
        if (searchTerm) {
          filters['title.contains'] = searchTerm;
        }

        const result = await fetchEventPollsServer(filters);
        setPolls(result.data);
        setTotalCount(result.totalCount);
      } catch (error) {
        console.error('Error loading polls:', error);
        setPolls([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadPolls();
  }, [eventId, currentPage, searchTerm]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0); // Reset to first page on search
  };

  const handlePollClick = async (poll: EventPollDTO) => {
    try {
      console.log('Fetching options for poll:', poll.id, poll.title);
      const options = await fetchEventPollOptionsServer({
        'pollId.equals': poll.id,
        'isActive.equals': true
      });
      
      console.log('Fetched poll options:', options);
      setSelectedPoll(poll);
      setPollOptions(options);
      onPollSelect?.(poll, options);
    } catch (error) {
      console.error('Error loading poll options:', error);
      // Still show the poll even if options fail to load
      setSelectedPoll(poll);
      setPollOptions([]);
      onPollSelect?.(poll, []);
    }
  };

  const getPollStatus = (poll: EventPollDTO) => {
    const now = new Date();
    const startDate = new Date(poll.startDate);
    const endDate = poll.endDate ? new Date(poll.endDate) : null;

    if (!poll.isActive) {
      return { 
        text: 'Inactive', 
        variant: 'secondary' as const,
        className: 'bg-gray-100 text-gray-600 border-gray-200'
      };
    }

    if (now < startDate) {
      return { 
        text: 'Not Started', 
        variant: 'outline' as const,
        className: 'bg-yellow-50 text-yellow-700 border-yellow-200'
      };
    }

    if (endDate && now > endDate) {
      return { 
        text: 'Ended', 
        variant: 'destructive' as const,
        className: 'bg-red-50 text-red-700 border-red-200'
      };
    }

    return { 
      text: 'Active', 
      variant: 'default' as const,
      className: 'bg-green-50 text-green-700 border-green-200'
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isPollActive = (poll: EventPollDTO) => {
    const now = new Date();
    const startDate = new Date(poll.startDate);
    const endDate = poll.endDate ? new Date(poll.endDate) : null;

    return poll.isActive && now >= startDate && (!endDate || now <= endDate);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (selectedPoll) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedPoll(null)}
            className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
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
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            {selectedPoll.title}
          </h2>
        </div>
        <PollVotingCard
          poll={selectedPoll}
          options={pollOptions}
          userId={userId}
          onVoteSubmitted={() => {
            // Refresh poll data or show success message
            setSelectedPoll(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {polls.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Available Polls
            </h2>
            {totalCount > 0 && (
              <Badge className="bg-blue-100 text-blue-800 border border-blue-300 px-3 py-1">
                {totalCount} poll{totalCount !== 1 ? 's' : ''} available
              </Badge>
            )}
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search polls..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-12 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 transition-all"
            />
          </div>
        </>
      )}

      {polls.length === 0 && !isLoading ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">No polls available at this time</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {polls.map((poll) => {
            const status = getPollStatus(poll);
            const active = isPollActive(poll);

            return (
              <Card 
                key={poll.id} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-md border border-gray-200 ${
                  active 
                    ? 'bg-white hover:shadow-lg' 
                    : 'opacity-75 bg-gray-50'
                }`}
                onClick={() => handlePollClick(poll)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{poll.title}</CardTitle>
                      {poll.description && (
                        <CardDescription className="line-clamp-2">
                          {poll.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge className={status.className}>{status.text}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Starts: {formatDate(poll.startDate)}
                      </div>
                      {poll.endDate && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Ends: {formatDate(poll.endDate)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Max: {poll.maxResponsesPerUser || 1} per user
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        {poll.allowMultipleChoices ? 'Multiple choice' : 'Single choice'}
                      </div>
                      {poll.isAnonymous && (
                        <div className="flex items-center">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            Anonymous
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        className={`flex-shrink-0 h-14 rounded-xl flex items-center justify-center gap-0 sm:gap-3 transition-all duration-300 hover:scale-105 px-6 ${
                          active 
                            ? 'bg-blue-100 hover:bg-blue-200' 
                            : 'bg-gray-100 hover:bg-gray-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        disabled={!active}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePollClick(poll);
                        }}
                        title={active ? 'Vote Now' : 'View Details'}
                        aria-label={active ? 'Vote Now' : 'View Details'}
                        type="button"
                      >
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                          active ? 'bg-blue-200' : 'bg-gray-200'
                        }`}>
                          <svg className={`w-6 h-6 ${active ? 'text-blue-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <span className={`font-semibold hidden sm:inline ${active ? 'text-blue-700' : 'text-gray-700'}`}>
                          {active ? 'Vote Now' : 'View Details'}
                        </span>
                      </button>
                      
                      <Link
                        href={`/polls/${poll.id}`}
                        className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-0 sm:gap-3 transition-all duration-300 hover:scale-105 px-6"
                        title="View Full Page"
                        aria-label="View Full Page"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                        <span className="font-semibold text-green-700 hidden sm:inline">Full Page</span>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Controls - Only visible when there are polls */}
      {polls.length > 0 && (
      <div className="mt-8">
        <div className="flex justify-between items-center">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0 || isLoading}
            className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
            title="Previous Page"
            aria-label="Previous Page"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>

          {/* Page Info */}
          <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
            <span className="text-sm font-bold text-blue-700">
              Page <span className="text-blue-600">{currentPage + 1}</span> of <span className="text-blue-600">{Math.max(1, Math.ceil(totalCount / pageSize))}</span>
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= Math.ceil(totalCount / pageSize) - 1 || isLoading}
            className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
            title="Next Page"
            aria-label="Next Page"
            type="button"
          >
            <span>Next</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Item Count Text */}
        <div className="text-center mt-3">
          {totalCount > 0 ? (
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
              <span className="text-sm text-gray-700">
                Showing <span className="font-bold text-blue-600">{currentPage * pageSize + 1}</span> to <span className="font-bold text-blue-600">{Math.min((currentPage + 1) * pageSize, totalCount)}</span> of <span className="font-bold text-blue-600">{totalCount}</span> polls
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-orange-700">No polls found</span>
              <span className="text-sm text-orange-600">[No polls match your criteria]</span>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

// Import PollVotingCard component
import { PollVotingCard } from './PollVotingCard';
