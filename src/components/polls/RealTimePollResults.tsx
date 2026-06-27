'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users } from 'lucide-react';
import type { EventPollDTO, EventPollOptionDTO, EventPollResponseDTO } from '@/types';
import { fetchEventPollResponsesServer } from '@/app/admin/polls/ApiServerActions';

interface RealTimePollResultsProps {
  poll: EventPollDTO;
  options: EventPollOptionDTO[];
  refreshInterval?: number; // Deprecated - no longer used
  onRefresh?: () => void; // Deprecated - no longer used
}

interface OptionStats {
  option: EventPollOptionDTO;
  count: number;
  percentage: number;
}

export function RealTimePollResults({ 
  poll, 
  options
}: RealTimePollResultsProps) {
  const [responses, setResponses] = useState<EventPollResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Use refs to prevent infinite loops and duplicate fetches
  const isFetchingRef = useRef(false);
  const fetchedPollIdRef = useRef<number | null>(null);


  // Only fetch on initial mount or when poll.id changes
  useEffect(() => {
    // Only fetch if we haven't fetched this poll ID yet
    if (fetchedPollIdRef.current === poll.id) {
      return;
    }

    // Prevent duplicate simultaneous fetches
    if (isFetchingRef.current) {
      return;
    }

    // Reset state when poll.id changes
    if (fetchedPollIdRef.current !== null && fetchedPollIdRef.current !== poll.id) {
      setResponses([]);
      setIsLoading(true);
    }

    // Fetch responses
    const fetchData = async () => {
      isFetchingRef.current = true;
      fetchedPollIdRef.current = poll.id;

      try {
        setIsLoading(true);
        const pollResponses = await fetchEventPollResponsesServer({
          'pollId.equals': poll.id
        });
        
        // Only update if we're still on the same poll
        if (fetchedPollIdRef.current === poll.id) {
          setResponses(pollResponses);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Error loading poll responses:', error);
      } finally {
        if (fetchedPollIdRef.current === poll.id) {
          setIsLoading(false);
        }
        isFetchingRef.current = false;
      }
    };

    fetchData();
  }, [poll.id]); // Only depend on poll.id - this ensures we only fetch once per poll.id

  // Manual refresh handler (allows re-fetching)
  const handleManualRefresh = async () => {
    // Prevent duplicate simultaneous fetches
    if (isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;

    try {
      setIsLoading(true);
      const pollResponses = await fetchEventPollResponsesServer({
        'pollId.equals': poll.id
      });
      
      setResponses(pollResponses);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading poll responses:', error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  const getOptionStats = (): OptionStats[] => {
    const optionStats = options.map(option => {
      const optionResponses = responses.filter(response => response.pollOptionId === option.id);
      const count = optionResponses.length;
      const percentage = responses.length > 0 ? (count / responses.length) * 100 : 0;

      return {
        option,
        count,
        percentage,
      };
    });

    return optionStats.sort((a, b) => b.count - a.count);
  };

  const optionStats = getOptionStats();
  const totalResponses = responses.length;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Poll Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Poll Results
          </CardTitle>
          <button
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="flex-shrink-0 h-14 rounded-xl bg-orange-100 hover:bg-orange-200 flex items-center justify-center gap-0 sm:gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 px-4 sm:px-6"
            title={isLoading ? 'Refreshing...' : 'Refresh Results'}
            aria-label={isLoading ? 'Refreshing...' : 'Refresh Results'}
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-200 flex items-center justify-center">
              {isLoading ? (
                <svg className="animate-spin w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
            </div>
            <span className="font-semibold text-orange-700 hidden sm:inline">{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
        <CardDescription>
          Last updated: {formatTime(lastUpdated)} • {totalResponses} total response{totalResponses !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {optionStats.map((stat) => (
            <div key={stat.option.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{stat.option.optionText}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {stat.count} vote{stat.count !== 1 ? 's' : ''}
                  </span>
                  <Badge variant="outline">
                    {stat.percentage.toFixed(1)}%
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${stat.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {totalResponses === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No votes yet. Be the first to vote!</p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Click Refresh to update results
            </span>
            <span>
              Poll {poll.isActive ? 'is active' : 'is inactive'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

