'use client';

import { useState, useEffect } from 'react';
import { FaSpinner, FaCheckCircle, FaExclamationTriangle, FaPause, FaPlay, FaStop } from 'react-icons/fa';

interface SendingProgressProps {
  progress: any;
  onComplete: (reportData: any) => void;
}

export default function SendingProgress({ progress, onComplete }: SendingProgressProps) {
  const [currentProgress, setCurrentProgress] = useState(progress);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('Calculating...');

  useEffect(() => {
    if (!currentProgress.inProgress) return;

    const interval = setInterval(() => {
      setCurrentProgress(prev => {
        const newProgress = { ...prev };

        // Simulate progress
        if (newProgress.sent < newProgress.total) {
          newProgress.sent = Math.min(newProgress.sent + Math.floor(Math.random() * 5) + 1, newProgress.total);
          newProgress.delivered = Math.floor(newProgress.sent * 0.95); // 95% delivery rate
          newProgress.failed = newProgress.sent - newProgress.delivered;
        }

        // Check if completed
        if (newProgress.sent >= newProgress.total) {
          newProgress.inProgress = false;
          setTimeout(() => {
            onComplete({
              total: newProgress.total,
              sent: newProgress.sent,
              delivered: newProgress.delivered,
              failed: newProgress.failed,
              deliveryRate: (newProgress.delivered / newProgress.sent * 100).toFixed(1),
              completedAt: new Date().toISOString()
            });
          }, 1000);
        }

        return newProgress;
      });

      // Update time remaining
      const remaining = Math.ceil((currentProgress.total - currentProgress.sent) / 10);
      setTimeRemaining(remaining > 0 ? `${remaining} minutes` : 'Almost done...');
    }, 2000);

    return () => clearInterval(interval);
  }, [currentProgress.inProgress, currentProgress.total, currentProgress.sent, onComplete]);

  const handlePause = () => {
    setIsPaused(!isPaused);
    // In real implementation, this would pause the actual sending process
  };

  const handleStop = () => {
    if (confirm('Are you sure you want to stop sending? This action cannot be undone.')) {
      setCurrentProgress(prev => ({ ...prev, inProgress: false }));
      onComplete({
        total: currentProgress.total,
        sent: currentProgress.sent,
        delivered: currentProgress.delivered,
        failed: currentProgress.failed,
        deliveryRate: (currentProgress.delivered / currentProgress.sent * 100).toFixed(1),
        status: 'cancelled',
        completedAt: new Date().toISOString()
      });
    }
  };

  const progressPercentage = (currentProgress.sent / currentProgress.total) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Sending Progress</h3>
        <p className="text-sm text-gray-600">
          Your WhatsApp messages are being sent to recipients
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {currentProgress.inProgress ? (
              <FaSpinner className="h-6 w-6 text-blue-500 animate-spin" />
            ) : (
              <FaCheckCircle className="h-6 w-6 text-green-500" />
            )}
            <div>
              <h4 className="text-lg font-medium text-gray-900">
                {currentProgress.inProgress ? 'Sending Messages...' : 'Sending Complete'}
              </h4>
              <p className="text-sm text-gray-600">
                {currentProgress.sent} of {currentProgress.total} messages sent
              </p>
            </div>
          </div>

          {currentProgress.inProgress && (
            <div className="flex items-center gap-2">
              <button
                onClick={handlePause}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-1"
              >
                {isPaused ? <FaPlay className="h-3 w-3" /> : <FaPause className="h-3 w-3" />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={handleStop}
                className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 border border-red-300 rounded-md hover:bg-red-200 flex items-center gap-1"
              >
                <FaStop className="h-3 w-3" />
                Stop
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{currentProgress.sent}</div>
            <div className="text-sm text-gray-600">Sent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{currentProgress.delivered}</div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{currentProgress.failed}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{currentProgress.total - currentProgress.sent}</div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
        </div>
      </div>

      {/* Detailed Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-900 mb-3">Delivery Rate</h5>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(currentProgress.delivered / Math.max(currentProgress.sent, 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-900">
              {((currentProgress.delivered / Math.max(currentProgress.sent, 1)) * 100).toFixed(1)}%
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {currentProgress.delivered} delivered out of {currentProgress.sent} sent
          </p>
        </div>

        {/* Time Remaining */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-900 mb-3">Estimated Time Remaining</h5>
          <div className="text-2xl font-bold text-blue-600 mb-2">{timeRemaining}</div>
          <p className="text-xs text-gray-500">
            Based on current sending rate
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h5>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <div className="flex items-center gap-2 text-sm">
            <FaCheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-gray-600">Started sending campaign</span>
            <span className="text-gray-400 ml-auto">Just now</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FaSpinner className="h-4 w-4 text-blue-500 animate-spin" />
            <span className="text-gray-600">Sending messages to recipients...</span>
            <span className="text-gray-400 ml-auto">In progress</span>
          </div>
          {currentProgress.failed > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <FaExclamationTriangle className="h-4 w-4 text-red-500" />
              <span className="text-gray-600">{currentProgress.failed} messages failed</span>
              <span className="text-gray-400 ml-auto">Recent</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {currentProgress.inProgress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <FaSpinner className="text-blue-500 mr-3 mt-0.5 animate-spin" />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Sending in Progress</h4>
              <p className="text-sm text-blue-700 mt-1">
                Your messages are being sent at a rate that complies with WhatsApp's messaging policies.
                You can pause or stop the sending process at any time.
              </p>
            </div>
          </div>
        </div>
      )}

      {!currentProgress.inProgress && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <FaCheckCircle className="text-green-500 mr-3 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-800">Sending Complete</h4>
              <p className="text-sm text-green-700 mt-1">
                All messages have been processed. You can now view the delivery report.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
















