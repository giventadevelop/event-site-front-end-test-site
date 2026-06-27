'use client';

import { useEffect, useState, useRef } from 'react';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
}

export default function DebugLogViewer() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const originalConsoleLog = useRef<typeof console.log | null>(null);
  const originalConsoleError = useRef<typeof console.error | null>(null);
  const originalConsoleWarn = useRef<typeof console.warn | null>(null);
  const pendingLogsRef = useRef<LogEntry[]>([]);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Process pending logs after render
  useEffect(() => {
    if (pendingLogsRef.current.length > 0) {
      setLogs(prev => [...prev, ...pendingLogsRef.current]);
      pendingLogsRef.current = [];
    }
  });

  useEffect(() => {
    // Store original console methods
    originalConsoleLog.current = console.log;
    originalConsoleError.current = console.error;
    originalConsoleWarn.current = console.warn;

    // Helper to add log entry (deferred to avoid render-time state updates)
    const addLogEntry = (entry: LogEntry) => {
      if (isPaused) return;

      // Add to pending logs
      pendingLogsRef.current.push(entry);

      // Clear existing timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      // Schedule state update after current render cycle
      updateTimeoutRef.current = setTimeout(() => {
        if (pendingLogsRef.current.length > 0) {
          setLogs(prev => [...prev, ...pendingLogsRef.current]);
          pendingLogsRef.current = [];
        }
      }, 0);
    };

    // Override console.log
    console.log = (...args: any[]) => {
      const message = args.find(arg => typeof arg === 'string') || '';
      const data = args.find(arg => typeof arg === 'object' && arg !== null) || {};
      addLogEntry({
        timestamp: new Date().toISOString(),
        level: 'log',
        message,
        data: Object.keys(data).length > 0 ? data : undefined,
      });
      // Call original console.log
      originalConsoleLog.current?.(...args);
    };

    // Override console.error
    console.error = (...args: any[]) => {
      const message = args.find(arg => typeof arg === 'string') || '';
      const data = args.find(arg => typeof arg === 'object' && arg !== null) || {};
      addLogEntry({
        timestamp: new Date().toISOString(),
        level: 'error',
        message,
        data: Object.keys(data).length > 0 ? data : undefined,
      });
      // Call original console.error
      originalConsoleError.current?.(...args);
    };

    // Override console.warn
    console.warn = (...args: any[]) => {
      const message = args.find(arg => typeof arg === 'string') || '';
      const data = args.find(arg => typeof arg === 'object' && arg !== null) || {};
      addLogEntry({
        timestamp: new Date().toISOString(),
        level: 'warn',
        message,
        data: Object.keys(data).length > 0 ? data : undefined,
      });
      // Call original console.warn
      originalConsoleWarn.current?.(...args);
    };

    return () => {
      // Clear timeout
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      // Restore original console methods
      if (originalConsoleLog.current) console.log = originalConsoleLog.current;
      if (originalConsoleError.current) console.error = originalConsoleError.current;
      if (originalConsoleWarn.current) console.warn = originalConsoleWarn.current;
    };
  }, [isPaused]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logsEndRef.current && isExpanded) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded]);

  const copyLogs = () => {
    try {
      const logText = logs.map(log => {
        const dataStr = log.data ? `\n  Data: ${JSON.stringify(log.data, null, 2)}` : '';
        return `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${dataStr}`;
      }).join('\n\n');

      // Create a temporary textarea element for better clipboard support
      const textarea = document.createElement('textarea');
      textarea.value = logText;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, 99999); // For mobile devices

      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);

      if (successful) {
        alert(`✅ Copied ${logs.length} log entries to clipboard!`);
      } else {
        // Fallback to modern clipboard API
        navigator.clipboard.writeText(logText).then(() => {
          alert(`✅ Copied ${logs.length} log entries to clipboard!`);
        }).catch(err => {
          console.error('Failed to copy logs:', err);
          alert('❌ Failed to copy logs. Please select and copy manually.');
        });
      }
    } catch (err) {
      console.error('Failed to copy logs:', err);
      alert('❌ Failed to copy logs. Please select and copy manually.');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (!isExpanded) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black p-2 text-xs">
        <button
          onClick={() => setIsExpanded(true)}
          className="font-bold"
        >
          📋 Debug Logs ({logs.length}) - Click to Expand
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black text-green-400 font-mono text-xs max-h-[40vh] overflow-y-auto border-b-2 border-yellow-500">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900 p-2 flex items-center justify-between border-b border-yellow-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-yellow-400">📋 Debug Console Logs ({logs.length})</span>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-2 py-1 rounded text-xs ${isPaused ? 'bg-red-600' : 'bg-green-600'} text-white`}
          >
            {isPaused ? '▶ Resume' : '⏸ Pause'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyLogs}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
          >
            📋 Copy All
          </button>
          <button
            onClick={clearLogs}
            className="px-2 py-1 bg-red-600 text-white rounded text-xs"
          >
            🗑 Clear
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="px-2 py-1 bg-gray-600 text-white rounded text-xs"
          >
            ▲ Collapse
          </button>
        </div>
      </div>

      {/* Logs */}
      <div className="p-2 space-y-1">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`p-2 rounded border-l-2 ${
                log.level === 'error' ? 'border-red-500 bg-red-900/20' :
                log.level === 'warn' ? 'border-yellow-500 bg-yellow-900/20' :
                'border-green-500 bg-green-900/20'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-gray-500 text-[10px] flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`font-bold ${
                  log.level === 'error' ? 'text-red-400' :
                  log.level === 'warn' ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  [{log.level.toUpperCase()}]
                </span>
                <span className="flex-1 break-words">{log.message}</span>
              </div>
              {log.data && (
                <div className="mt-1 ml-4 text-[10px] text-gray-400 overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(log.data, null, 2)}</pre>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}

