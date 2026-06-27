'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, User, Clock, AlertCircle } from 'lucide-react';
import type { EventPollDTO, EventPollResponseDTO } from '@/types';
import { fetchEventPollResponsesServer } from '@/app/admin/polls/ApiServerActions';

interface PollCommentsProps {
  poll: EventPollDTO;
  userId?: number;
  onCommentAdded?: () => void;
  showAddComment?: boolean;
}

interface CommentWithUser extends EventPollResponseDTO {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export function PollComments({ 
  poll, 
  userId, 
  onCommentAdded,
  showAddComment = true 
}: PollCommentsProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [poll.id]);

  const loadComments = async () => {
    try {
      const responses = await fetchEventPollResponsesServer({
        'pollId.equals': poll.id,
        'comment.isNotNull': true, // Only get responses with comments
      });
      
      // Sort by creation date (newest first)
      const sortedComments = responses
        .filter(response => response.comment && response.comment.trim())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setComments(sortedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      setError('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      setError('Please enter a comment');
      return;
    }

    if (!userId) {
      setError('You must be logged in to comment');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Note: This would need to be implemented as a separate API call
      // For now, we'll just simulate adding a comment
      const newCommentData: CommentWithUser = {
        id: Date.now(), // Temporary ID
        pollId: poll.id!,
        userId,
        comment: newComment.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
          firstName: 'You',
          lastName: '',
          email: '',
        },
      };

      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');
      onCommentAdded?.();
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getUserDisplayName = (comment: CommentWithUser) => {
    if (comment.user?.firstName && comment.user?.lastName) {
      return `${comment.user.firstName} ${comment.user.lastName}`;
    } else if (comment.user?.firstName) {
      return comment.user.firstName;
    } else if (comment.user?.email) {
      return comment.user.email.split('@')[0];
    } else {
      return 'Anonymous User';
    }
  };

  const canComment = () => {
    if (!userId) return false;
    if (!poll.isActive) return false;
    
    const now = new Date();
    const startDate = new Date(poll.startDate);
    const endDate = poll.endDate ? new Date(poll.endDate) : null;
    
    return now >= startDate && (!endDate || now <= endDate);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
        <CardTitle className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          Comments
          {comments.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {comments.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Share your thoughts about this poll
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment Form */}
        {showAddComment && (
          <div className="space-y-3">
            {canComment() ? (
              <div className="space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts about this poll..."
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {newComment.length}/500 characters
                  </div>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={isSubmitting || !newComment.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>
                  {!userId 
                    ? 'Please log in to comment on this poll.'
                    : !poll.isActive
                    ? 'This poll is not active.'
                    : 'Comments are not available for this poll.'
                  }
                </p>
                {!userId && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => window.location.href = '/sign-in'}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-sm">
                      {getUserDisplayName(comment)}
                    </span>
                    {comment.userId === userId && (
                      <Badge variant="outline" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {comment.comment}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button (if needed) */}
        {comments.length > 10 && (
          <div className="text-center">
            <Button variant="outline" size="sm">
              Load More Comments
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}





