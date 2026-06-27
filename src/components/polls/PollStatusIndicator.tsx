'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { EventPollDTO } from '@/types';

interface PollStatusIndicatorProps {
  poll: EventPollDTO;
  showCountdown?: boolean;
  showDetails?: boolean;
}

export function PollStatusIndicator({ 
  poll, 
  showCountdown = true, 
  showDetails = false 
}: PollStatusIndicatorProps) {
  const [timeUntilChange, setTimeUntilChange] = useState<{
    type: 'activate' | 'deactivate' | 'none';
    time: number;
    message: string;
  } | null>(null);

  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const checkPollStatus = () => {
      const now = new Date();
      const startDate = new Date(poll.startDate);
      const endDate = poll.endDate ? new Date(poll.endDate) : null;

      // Check if poll is currently active
      const active = poll.isActive && now >= startDate && (!endDate || now <= endDate);
      setIsActive(active);

      // Calculate time until change
      if (startDate > now && !poll.isActive) {
        const timeUntil = startDate.getTime() - now.getTime();
        setTimeUntilChange({
          type: 'activate',
          time: timeUntil,
          message: `Starts in ${formatTimeRemaining(timeUntil)}`,
        });
      } else if (endDate && endDate > now && poll.isActive) {
        const timeUntil = endDate.getTime() - now.getTime();
        setTimeUntilChange({
          type: 'deactivate',
          time: timeUntil,
          message: `Ends in ${formatTimeRemaining(timeUntil)}`,
        });
      } else {
        setTimeUntilChange({
          type: 'none',
          time: 0,
          message: 'No scheduled changes',
        });
      }
    };

    checkPollStatus();
    
    // Update every minute
    const interval = setInterval(checkPollStatus, 60000);
    return () => clearInterval(interval);
  }, [poll]);

  const formatTimeRemaining = (milliseconds: number): string => {
    const totalMinutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0) {
      return `${days}d ${remainingHours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getStatusInfo = () => {
    const now = new Date();
    const startDate = new Date(poll.startDate);
    const endDate = poll.endDate ? new Date(poll.endDate) : null;

    if (!poll.isActive) {
      return {
        status: 'inactive',
        icon: XCircle,
        color: 'secondary',
        text: 'Inactive',
        description: 'This poll is not active',
      };
    }

    if (now < startDate) {
      return {
        status: 'scheduled',
        icon: Clock,
        color: 'outline',
        text: 'Scheduled',
        description: 'This poll has not started yet',
      };
    }

    if (endDate && now > endDate) {
      return {
        status: 'ended',
        icon: XCircle,
        color: 'destructive',
        text: 'Ended',
        description: 'This poll has ended',
      };
    }

    return {
      status: 'active',
      icon: CheckCircle,
      color: 'default',
      text: 'Active',
      description: 'This poll is currently accepting votes',
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <StatusIcon className={`h-4 w-4 ${
          statusInfo.status === 'active' ? 'text-green-600' :
          statusInfo.status === 'scheduled' ? 'text-blue-600' :
          statusInfo.status === 'ended' ? 'text-red-600' :
          'text-gray-600'
        }`} />
        <Badge variant={statusInfo.color as any}>
          {statusInfo.text}
        </Badge>
        {showCountdown && timeUntilChange && timeUntilChange.type !== 'none' && (
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {timeUntilChange.message}
          </Badge>
        )}
      </div>

      {showDetails && (
        <Card className="text-sm">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Status:</span> {statusInfo.description}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Start:</span> {formatDate(poll.startDate)}
                </div>
                {poll.endDate && (
                  <div>
                    <span className="font-medium">End:</span> {formatDate(poll.endDate)}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <span className="font-medium">Max Responses:</span> {poll.maxResponsesPerUser || 1} per user
                </div>
                <div>
                  <span className="font-medium">Multiple Choice:</span> {poll.allowMultipleChoices ? 'Yes' : 'No'}
                </div>
              </div>

              {poll.isAnonymous && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Voting:</span> Anonymous
                </div>
              )}

              {timeUntilChange && timeUntilChange.type !== 'none' && (
                <div className="text-xs text-blue-600">
                  <AlertCircle className="h-3 w-3 inline mr-1" />
                  {timeUntilChange.message}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

