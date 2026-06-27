'use client';

import { useState, useEffect, useRef } from 'react';
import { FaCopy, FaCheckCircle, FaChevronDown, FaChevronUp, FaTrash } from 'react-icons/fa';

interface LogEntry {
  timestamp: string;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  data?: any;
}

export default function MobileDebugConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Feature flag: Enable MobileDebugConsole only when explicitly enabled
  // Set NEXT_PUBLIC_ENABLE_MOBILE_DEBUG_CONSOLE=true to enable (default: disabled)
  const isEnabled = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_MOBILE_DEBUG_CONSOLE === 'true';

  // Ensure component only renders on client after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Calculate counts safely (with fallbacks for SSR)
  const errorCount = (logs || []).filter(l => l.level === 'error').length;
  const warnCount = (logs || []).filter(l => l.level === 'warn').length;
  const mobileDetectionCount = (logs || []).filter(l => l.message?.includes('[MOBILE-DETECTION]')).length;
  const mobileWorkflowCount = (logs || []).filter(l => l.message?.includes('[MOBILE-WORKFLOW]')).length;

  // Intercept console methods (only when enabled)
  useEffect(() => {
    if (typeof window === 'undefined' || !isEnabled) return;

    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    const addLog = (level: 'log' | 'warn' | 'error' | 'info', ...args: any[]) => {
      const timestamp = new Date().toISOString();
      const message = args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');

      setLogs(prev => [...prev, { timestamp, level, message, data: args }]);
    };

    console.log = (...args) => {
      originalLog.apply(console, args);
      addLog('log', ...args);
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      addLog('warn', ...args);
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      addLog('error', ...args);
    };

    console.info = (...args) => {
      originalInfo.apply(console, args);
      addLog('info', ...args);
    };

    // Log initial page load
    console.log('[MobileDebugConsole] Mobile debug console initialized');
    console.log('[MobileDebugConsole] User Agent:', navigator.userAgent);
    console.log('[MobileDebugConsole] Current URL:', window.location.href);
    console.log('[MobileDebugConsole] Timestamp:', new Date().toISOString());

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
    };
  }, []);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (isExpanded) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded]);

  const copyLogsToClipboard = async () => {
    // Safety check for SSR
    if (!logs || logs.length === 0) {
      alert('No logs to copy yet.');
      return;
    }

    // Enhanced log formatting with better structure for mobile detection logs
    const logsText = logs.map(log => {
      const timestamp = new Date(log.timestamp).toISOString();
      const level = log.level.toUpperCase().padEnd(5);
      const message = log.message;

      // Format mobile detection logs with extra context
      if (message.includes('[MOBILE-DETECTION]')) {
        return `[${timestamp}] [${level}] ${message}`;
      }

      // Format mobile workflow logs
      if (message.includes('[MOBILE-WORKFLOW]')) {
        return `[${timestamp}] [${level}] ${message}`;
      }

      return `[${timestamp}] [${level}] ${message}`;
    }).join('\n');

    // Add header with context
    const header = `=== Mobile Debug Console Logs ===
Generated: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
URL: ${window.location.href}
Total Logs: ${logs.length}
Errors: ${logs.filter(l => l.level === 'error').length}
Warnings: ${logs.filter(l => l.level === 'warn').length}
Mobile Detection Logs: ${logs.filter(l => l.message.includes('[MOBILE-DETECTION]')).length}
Mobile Workflow Logs: ${logs.filter(l => l.message.includes('[MOBILE-WORKFLOW]')).length}
========================================

`;

    const fullLogsText = header + logsText;

    try {
      await navigator.clipboard.writeText(fullLogsText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers and mobile browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullLogsText;
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '100%';
      textArea.style.height = '100%';
      textArea.style.opacity = '0';
      textArea.style.zIndex = '99999';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);

      // For mobile browsers, select all text
      if (navigator.userAgent.match(/Mobile|Android|iPhone|iPad/i)) {
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999); // For mobile devices
      } else {
        textArea.select();
      }

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } else {
          // Show alert for manual copy on mobile
          alert('Please manually select and copy the logs from the console.');
        }
      } catch (err) {
        console.error('[MobileDebugConsole] Copy failed:', err);
        alert('Copy failed. Please manually select and copy the logs.');
      }
      document.body.removeChild(textArea);
    }
  };

  const clearLogs = () => {
    setLogs([]);
    console.log('[MobileDebugConsole] Logs cleared');
  };

  // Don't render during SSR, before hydration, or if disabled
  if (typeof window === 'undefined' || !isMounted || !isEnabled) {
    return null;
  }

  const getLogColor = (level: string, message: string) => {
    // Highlight mobile detection logs
    if (message?.includes('[MOBILE-DETECTION]')) {
      if (message.includes('✅✅✅') || message.includes('MOBILE BROWSER DETECTED')) {
        return 'text-green-700 bg-green-50 border-green-300 font-semibold';
      }
      if (message.includes('❌') || message.includes('DESKTOP BROWSER DETECTED')) {
        return 'text-gray-700 bg-gray-50 border-gray-300';
      }
      return 'text-purple-600 bg-purple-50 border-purple-200';
    }

    // Highlight mobile workflow logs
    if (message?.includes('[MOBILE-WORKFLOW]')) {
      return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    }

    // Standard level-based colors
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warn': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t-2 border-gray-300 shadow-2xl">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white cursor-pointer hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold">Debug Console</span>
          {errorCount > 0 && (
            <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              {errorCount} errors
            </span>
          )}
          {warnCount > 0 && (
            <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              {warnCount} warnings
            </span>
          )}
          {mobileDetectionCount > 0 && (
            <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              {mobileDetectionCount} mobile
            </span>
          )}
          {mobileWorkflowCount > 0 && (
            <span className="bg-indigo-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
              {mobileWorkflowCount} workflow
            </span>
          )}
          <span className="text-gray-400 text-sm">
            {logs.length} logs
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isExpanded && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyLogsToClipboard();
                }}
                className="p-2 hover:bg-gray-600 rounded transition-colors"
                title="Copy logs to clipboard"
              >
                {copySuccess ? <FaCheckCircle className="text-green-400" /> : <FaCopy />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearLogs();
                }}
                className="p-2 hover:bg-gray-600 rounded transition-colors"
                title="Clear logs"
              >
                <FaTrash />
              </button>
            </>
          )}
          {isExpanded ? <FaChevronDown /> : <FaChevronUp />}
        </div>
      </div>

      {/* Logs Panel */}
      {isExpanded && (
        <div className="max-h-[60vh] overflow-y-auto bg-gray-900 text-white">
          {/* Action Buttons */}
          <div className="sticky top-0 bg-gray-800 px-4 py-2 border-b border-gray-700 flex gap-2">
            <button
              onClick={copyLogsToClipboard}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors"
            >
              {copySuccess ? (
                <>
                  <FaCheckCircle /> Copied!
                </>
              ) : (
                <>
                  <FaCopy /> Copy All Logs
                </>
              )}
            </button>
            <button
              onClick={clearLogs}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
            >
              <FaTrash /> Clear
            </button>
          </div>

          {/* Log Entries */}
          <div className="p-2 space-y-1">
            {logs.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No logs yet. Console output will appear here.
              </div>
            ) : (
              logs.map((log, index) => {
                const isMobileDetection = log.message.includes('[MOBILE-DETECTION]');
                const isMobileWorkflow = log.message.includes('[MOBILE-WORKFLOW]');
                const isImportant = isMobileDetection || isMobileWorkflow;

                return (
                  <div
                    key={index}
                    className={`p-2 border-l-4 ${getLogColor(log.level, log.message)} rounded text-xs font-mono whitespace-pre-wrap break-all ${isImportant ? 'ring-1 ring-opacity-50' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400 flex-shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`font-bold flex-shrink-0 uppercase ${log.level === 'error' ? 'text-red-400' :
                          log.level === 'warn' ? 'text-yellow-400' :
                            log.level === 'info' ? 'text-blue-400' : 'text-green-400'
                        }`}>
                        {log.level}
                      </span>
                      {isMobileDetection && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 bg-purple-600 text-white text-xs font-bold rounded">
                          MOBILE
                        </span>
                      )}
                      {isMobileWorkflow && (
                        <span className="flex-shrink-0 px-1.5 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded">
                          WORKFLOW
                        </span>
                      )}
                      <span className="flex-1">{log.message}</span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}
