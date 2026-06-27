'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Clock, 
  MessageSquare, 
  Download,
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';
import type { EventPollDTO, EventPollOptionDTO, EventPollResponseDTO } from '@/types';
import { fetchEventPollResponsesServer } from '@/app/admin/polls/ApiServerActions';

interface PollAnalyticsDashboardProps {
  poll: EventPollDTO;
  options: EventPollOptionDTO[];
  onExport?: (data: any) => void;
}

interface AnalyticsData {
  totalResponses: number;
  uniqueVoters: number;
  responseRate: number;
  averageResponsesPerUser: number;
  optionStats: Array<{
    option: EventPollOptionDTO;
    count: number;
    percentage: number;
    voters: number;
  }>;
  timeStats: {
    responsesPerHour: Array<{ hour: string; count: number }>;
    peakHour: string;
  };
  commentStats: {
    totalComments: number;
    commentRate: number;
  };
}

export function PollAnalyticsDashboard({ poll, options, onExport }: PollAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRawData, setShowRawData] = useState(false);
  const [responses, setResponses] = useState<EventPollResponseDTO[]>([]);
  
  // Use refs to prevent infinite loops
  const optionsRef = useRef(options);
  const isFetchingRef = useRef(false);

  // Update ref when options change (without triggering re-renders)
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    // Prevent duplicate simultaneous fetches
    if (isFetchingRef.current) {
      return;
    }

    const loadAnalytics = async () => {
      isFetchingRef.current = true;
      try {
        const pollResponses = await fetchEventPollResponsesServer({
          'pollId.equals': poll.id
        });
        
        setResponses(pollResponses);
        // Use ref to get latest options without including in dependencies
        const analyticsData = calculateAnalytics(pollResponses, optionsRef.current);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error loading poll analytics:', error);
      } finally {
        setIsLoading(false);
        // Reset fetch guard after a short delay
        setTimeout(() => {
          isFetchingRef.current = false;
        }, 100);
      }
    };

    loadAnalytics();
  }, [poll.id]); // Removed options from dependencies to prevent infinite loops

  const calculateAnalytics = (responses: EventPollResponseDTO[], currentOptions: EventPollOptionDTO[]): AnalyticsData => {
    const uniqueVoters = new Set(responses.map(r => r.userId).filter(Boolean)).size;
    const totalResponses = responses.length;
    
    // Calculate option statistics
    const optionStats = currentOptions.map(option => {
      const optionResponses = responses.filter(r => r.pollOptionId === option.id);
      const uniqueVotersForOption = new Set(optionResponses.map(r => r.userId).filter(Boolean)).size;
      
      return {
        option,
        count: optionResponses.length,
        percentage: totalResponses > 0 ? (optionResponses.length / totalResponses) * 100 : 0,
        voters: uniqueVotersForOption,
      };
    }).sort((a, b) => b.count - a.count);

    // Calculate time-based statistics
    const responsesByHour: Record<string, number> = {};
    responses.forEach(response => {
      const hour = new Date(response.createdAt).getHours();
      const hourKey = `${hour}:00`;
      responsesByHour[hourKey] = (responsesByHour[hourKey] || 0) + 1;
    });

    const responsesPerHour = Object.entries(responsesByHour)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    const peakHour = responsesPerHour.reduce((max, current) => 
      current.count > max.count ? current : max, 
      { hour: '0:00', count: 0 }
    ).hour;

    // Calculate comment statistics
    const comments = responses.filter(r => r.comment && r.comment.trim()).length;
    const commentRate = totalResponses > 0 ? (comments / totalResponses) * 100 : 0;

    return {
      totalResponses,
      uniqueVoters,
      responseRate: uniqueVoters > 0 ? (totalResponses / uniqueVoters) : 0,
      averageResponsesPerUser: uniqueVoters > 0 ? totalResponses / uniqueVoters : 0,
      optionStats,
      timeStats: {
        responsesPerHour,
        peakHour,
      },
      commentStats: {
        totalComments: comments,
        commentRate,
      },
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportData = () => {
    if (!analytics) return;

    const exportData = {
      poll: {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        startDate: poll.startDate,
        endDate: poll.endDate,
        isActive: poll.isActive,
      },
      analytics,
      responses: responses.map(r => ({
        id: r.id,
        userId: r.userId,
        optionText: options.find(o => o.id === r.pollOptionId)?.optionText,
        comment: r.comment,
        createdAt: r.createdAt,
      })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poll-analytics-${poll.id}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onExport?.(exportData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Unable to load analytics data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Poll Analytics</h2>
          <p className="text-gray-600">{poll.title}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowRawData(!showRawData)}
          >
            {showRawData ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showRawData ? 'Hide' : 'Show'} Raw Data
          </Button>
          <Button onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold">{analytics.totalResponses}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Voters</p>
                <p className="text-2xl font-bold">{analytics.uniqueVoters}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Responses/User</p>
                <p className="text-2xl font-bold">{analytics.averageResponsesPerUser.toFixed(1)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comments</p>
                <p className="text-2xl font-bold">{analytics.commentStats.totalComments}</p>
                <p className="text-xs text-gray-500">
                  {analytics.commentStats.commentRate.toFixed(1)}% of responses
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Option Results */}
      <Card>
        <CardHeader>
          <CardTitle>Option Results</CardTitle>
          <CardDescription>Breakdown of votes by option</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.optionStats.map((stat, index) => (
              <div key={stat.option.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{stat.option.optionText}</span>
                    <Badge variant="outline">#{index + 1}</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {stat.count} votes ({stat.voters} voters)
                    </span>
                    <Badge variant="default">
                      {stat.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Time Analysis</CardTitle>
          <CardDescription>Voting patterns throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Peak Voting Hour</span>
              <Badge variant="default">{analytics.timeStats.peakHour}</Badge>
            </div>
            
            <div className="grid grid-cols-6 gap-2">
              {analytics.timeStats.responsesPerHour.map(({ hour, count }) => (
                <div key={hour} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">{hour}</div>
                  <div className="bg-blue-100 rounded h-8 flex items-end justify-center">
                    <div 
                      className="bg-blue-600 rounded-t w-full"
                      style={{ height: `${(count / Math.max(...analytics.timeStats.responsesPerHour.map(h => h.count))) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs font-medium mt-1">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Raw Data */}
      {showRawData && (
        <Card>
          <CardHeader>
            <CardTitle>Raw Response Data</CardTitle>
            <CardDescription>Complete response data for analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <pre className="text-xs bg-gray-100 p-4 rounded">
                {JSON.stringify(responses, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

