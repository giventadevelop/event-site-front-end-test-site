'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, MessageSquare, Calendar, Settings } from 'lucide-react';
import type { EventPollDTO, EventPollOptionDTO, EventPollResponseDTO } from '@/types';
import { fetchEventPollResponsesServer } from '../ApiServerActions';

interface PollDetailsModalProps {
  poll: EventPollDTO;
  options: EventPollOptionDTO[];
  onClose: () => void;
}

export function PollDetailsModal({ poll, options, onClose }: PollDetailsModalProps) {
  const [responses, setResponses] = useState<EventPollResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResponses = async () => {
      try {
        const pollResponses = await fetchEventPollResponsesServer({
          'pollId.equals': poll.id
        });
        setResponses(pollResponses);
      } catch (error) {
        console.error('Error fetching poll responses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResponses();
  }, [poll.id]);

  const getStatusBadge = () => {
    const now = new Date();
    const startDate = new Date(poll.startDate);
    const endDate = poll.endDate ? new Date(poll.endDate) : null;

    if (!poll.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }

    if (now < startDate) {
      return <Badge variant="outline">Scheduled</Badge>;
    }

    if (endDate && now > endDate) {
      return <Badge variant="destructive">Ended</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOptionStats = () => {
    const optionStats = options.map(option => {
      const optionResponses = responses.filter(response => response.pollOptionId === option.id);
      return {
        option,
        count: optionResponses.length,
        percentage: responses.length > 0 ? (optionResponses.length / responses.length) * 100 : 0,
      };
    });

    return optionStats.sort((a, b) => b.count - a.count);
  };

  const optionStats = getOptionStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">{poll.title}</h2>
            <div className="flex items-center space-x-2 mt-2">
              {getStatusBadge()}
              <span className="text-sm text-gray-500">
                {responses.length} response{responses.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Poll Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Poll Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {poll.description && (
                  <div>
                    <h4 className="font-medium text-gray-900">Description</h4>
                    <p className="text-gray-600">{poll.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Start Date:</span>
                    <p className="text-gray-600">{formatDate(poll.startDate)}</p>
                  </div>
                  {poll.endDate && (
                    <div>
                      <span className="font-medium text-gray-900">End Date:</span>
                      <p className="text-gray-600">{formatDate(poll.endDate)}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Max Responses:</span>
                    <p className="text-gray-600">{poll.maxResponsesPerUser || 1} per user</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Multiple Choices:</span>
                    <p className="text-gray-600">{poll.allowMultipleChoices ? 'Yes' : 'No'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Anonymous:</span>
                    <p className="text-gray-600">{poll.isAnonymous ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Results Visible:</span>
                    <p className="text-gray-600">{poll.resultsVisibleTo || 'All'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Poll Options and Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Poll Options & Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {optionStats.map((stat, index) => (
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
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stat.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Responses */}
          {responses.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Recent Responses
                </CardTitle>
                <CardDescription>
                  Latest {Math.min(10, responses.length)} responses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {responses.slice(0, 10).map((response) => {
                    const option = options.find(opt => opt.id === response.pollOptionId);
                    return (
                      <div key={response.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {option?.optionText || 'Unknown Option'}
                            </p>
                            {response.comment && (
                              <p className="text-gray-600 text-sm mt-1">
                                "{response.comment}"
                              </p>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 ml-2">
                            {new Date(response.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="flex-shrink-0 h-14 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
              title="Close"
              aria-label="Close"
              type="button"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="font-semibold text-gray-700">Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

