'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Users, BarChart3 } from 'lucide-react';
import type { EventPollDTO, EventPollOptionDTO, EventPollResponseDTO } from '@/types';
import { createEventPollResponseServer, fetchEventPollResponsesServer } from '@/app/admin/polls/ApiServerActions';

interface PollVotingCardProps {
  poll: EventPollDTO;
  options: EventPollOptionDTO[];
  userId?: number;
  onVoteSubmitted?: () => void;
}

function PollResultsDisplay({ poll, options }: { poll: EventPollDTO; options: EventPollOptionDTO[] }) {
  const [responses, setResponses] = useState<EventPollResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResponses = async () => {
      if (!poll.id) return;
      
      try {
        const pollResponses = await fetchEventPollResponsesServer({
          'pollId.equals': poll.id
        });
        setResponses(pollResponses);
      } catch (error) {
        console.error('Error loading poll responses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResponses();
  }, [poll.id]);

  const getOptionStats = () => {
    const optionStats = options.map(option => {
      const count = responses.filter(response => response.pollOption?.id === option.id).length;
      return {
        option,
        count,
        percentage: responses.length > 0 ? (count / responses.length) * 100 : 0
      };
    });

    return optionStats.sort((a, b) => b.count - a.count);
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Loading results...</p>
      </div>
    );
  }

  const optionStats = getOptionStats();
  const totalResponses = responses.length;

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-gray-600">
        {totalResponses} total response{totalResponses !== 1 ? 's' : ''}
      </div>
      
      <div className="space-y-3">
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
    </div>
  );
}

export function PollVotingCard({ poll, options, userId, onVoteSubmitted }: PollVotingCardProps) {
  const router = useRouter();
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [userResponses, setUserResponses] = useState<EventPollResponseDTO[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserResponses = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        const responses = await fetchEventPollResponsesServer({
          'pollId.equals': poll.id,
          'userId.equals': userId
        });
        setUserResponses(responses);
        setHasVoted(responses.length > 0);
        
        // If user has voted, show results
        if (responses.length > 0) {
          setShowResults(true);
        }
      } catch (error) {
        console.error('Error loading user responses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserResponses();
  }, [userId, poll.id]);

  const canVote = () => {
    if (!userId || !poll.isActive || hasVoted) return false;
    
    const now = new Date();
    const startDate = new Date(poll.startDate);
    const endDate = poll.endDate ? new Date(poll.endDate) : null;
    
    if (now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
  };

  const handleOptionChange = (optionId: number) => {
    if (poll.allowMultipleChoices) {
      setSelectedOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const redirectToSuccessPage = () => {
    // Redirect to success page with poll information
    const successUrl = `/polls/vote-success?pollTitle=${encodeURIComponent(poll.title || 'this poll')}&pollId=${poll.id}`;
    router.push(successUrl);
  };

  const handleSubmitVote = async () => {
    if (!userId || !poll.id || selectedOptions.length === 0) {
      alert('Please select an option and ensure you are logged in.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Submit responses for each selected option
      const responses = await Promise.all(
        selectedOptions.map(optionId => {
          const option = options.find(opt => opt.id === optionId);
          return createEventPollResponseServer({
            userId,
            pollId: poll.id!,
            pollOptionId: optionId,
            responseValue: option?.optionText || '',
            isAnonymous: poll.isAnonymous || false,
            comment: comment.trim() || undefined,
          });
        })
      );

      // Redirect to success page
      console.log('Vote submitted successfully, redirecting to success page');
      redirectToSuccessPage();
      
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPollStatus = () => {
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

  const status = getPollStatus();

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {poll.title}
              </CardTitle>
              {poll.description && (
                <CardDescription className="mt-2 text-gray-600 text-lg">
                  {poll.description}
                </CardDescription>
              )}
            </div>
            <Badge className={status.className || 'bg-green-50 text-green-700 border-green-200'}>
              {status.text}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-4">
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
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              Max: {poll.maxResponsesPerUser || 1} per user
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {canVote() ? (
            <div className="space-y-4">
              {options.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Poll Options Available</h3>
                  <p className="text-gray-600 mb-4">
                    This poll doesn't have any voting options configured yet. Please contact the poll administrator.
                  </p>
                  <button 
                    onClick={() => window.history.back()}
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
                    <span className="font-semibold text-indigo-700">Back to Polls</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {options.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center space-x-4 p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                          selectedOptions.includes(option.id!)
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type={poll.allowMultipleChoices ? 'checkbox' : 'radio'}
                          name="poll-option"
                          checked={selectedOptions.includes(option.id!)}
                          onChange={() => handleOptionChange(option.id!)}
                          className="w-5 h-5 text-blue-600 accent-blue-600"
                        />
                        <span className="flex-1 text-lg font-medium text-gray-700">
                          {option.optionText}
                        </span>
                        {selectedOptions.includes(option.id!) && (
                          <CheckCircle className="h-6 w-6 text-blue-600" />
                        )}
                      </label>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="comment" className="text-sm font-medium">
                      Add a comment (optional)
                    </label>
                    <Textarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts about this poll..."
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={handleSubmitVote}
                    disabled={isSubmitting || selectedOptions.length === 0}
                    className="w-full flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 px-6"
                    title="Submit Vote"
                    aria-label="Submit Vote"
                    type="button"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                      {isSubmitting ? (
                        <svg className="animate-spin w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="font-semibold text-blue-700">
                      {isSubmitting ? 'Submitting...' : 'Submit Vote'}
                    </span>
                  </button>
                  
                  {/* Manual test button for debugging */}
                </>
              )}
            </div>
          ) : hasVoted ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                <span className="font-medium">You have already voted!</span>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowResults(!showResults)}
                className="w-full"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showResults ? 'Hide Results' : 'View Results'}
              </Button>
            </div>
          ) : !userId ? (
            <div className="text-center space-y-4">
              <p className="text-gray-600">Please log in to vote on this poll.</p>
              <Button variant="outline" onClick={() => window.location.href = '/sign-in'}>
                Sign In
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                {status.text === 'Not Started' 
                  ? 'This poll has not started yet.'
                  : status.text === 'Ended'
                  ? 'This poll has ended.'
                  : 'This poll is currently inactive.'
                }
              </p>
              <Button
                variant="outline"
                onClick={() => setShowResults(!showResults)}
                className="w-full"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showResults ? 'Hide Results' : 'View Results'}
              </Button>
            </div>
          )}

          {showResults && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Poll Results
              </h3>
              <PollResultsDisplay poll={poll} options={options} />
            </div>
          )}
        </CardContent>
      </Card>

    </>
  );
}