'use client';

import HorizontalScrollTest from '@/components/HorizontalScrollTest';

export default function ScrollbarDemoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8" style={{ paddingTop: '120px' }}>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">
        Horizontal Scrollbar Demo
      </h1>

      <div className="space-y-12">
        {/* Demo 1: Simple Table with Horizontal Scroll */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Demo 1: Table with Horizontal Scrollbar Thumb
          </h2>
          <p className="text-gray-600 mb-4">
            This table has many columns and will show a horizontal scrollbar with a visible, draggable thumb.
          </p>

          <style dangerouslySetInnerHTML={{
            __html: `
              .demo-scroll-container {
                overflow-x: scroll !important;
                overflow-y: visible !important;
                scrollbar-width: thin !important;
                scrollbar-color: #9CA3AF #F3F4F6 !important;
                -ms-overflow-style: -ms-autohiding-scrollbar !important;
              }
              .demo-scroll-container::-webkit-scrollbar {
                height: 16px !important;
                display: block !important;
                -webkit-appearance: none !important;
                appearance: none !important;
              }
              .demo-scroll-container::-webkit-scrollbar-track {
                background: #F3F4F6 !important;
                border-radius: 8px !important;
                -webkit-box-shadow: inset 0 0 4px rgba(0,0,0,0.1) !important;
                box-shadow: inset 0 0 4px rgba(0,0,0,0.1) !important;
              }
              .demo-scroll-container::-webkit-scrollbar-thumb {
                background: #9CA3AF !important;
                border-radius: 8px !important;
                border: 3px solid #F3F4F6 !important;
                -webkit-box-shadow: inset 0 0 4px rgba(0,0,0,0.3) !important;
                box-shadow: inset 0 0 4px rgba(0,0,0,0.3) !important;
                min-width: 30px !important;
                background-clip: padding-box !important;
              }
              .demo-scroll-container::-webkit-scrollbar-thumb:hover {
                background: #6B7280 !important;
                border-color: #E5E7EB !important;
              }
              .demo-scroll-container::-webkit-scrollbar-thumb:active {
                background: #4B5563 !important;
                border-color: #D1D5DB !important;
              }
              .demo-scroll-container::-webkit-scrollbar-button {
                display: none !important;
              }
              .demo-scroll-container::-webkit-scrollbar-corner {
                background: #F3F4F6 !important;
              }
            `
          }} />

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div
              className="w-full demo-scroll-container"
              style={{
                overflowX: 'scroll',
                overflowY: 'visible',
                WebkitOverflowScrolling: 'touch',
                maxWidth: '100%',
                display: 'block',
                position: 'relative',
                width: '100%',
                minHeight: '1px',
                scrollbarGutter: 'stable'
              }}
            >
              <table className="divide-y divide-gray-200" style={{ width: 'max-content', minWidth: '1200px' }}>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Column 1</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Column 2</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Column 3</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Column 4</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Column 5</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Column 6</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Column 7</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Column 8</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Column 9</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Column 10</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[1, 2, 3, 4, 5].map((row) => (
                    <tr key={row} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">Data {row}-1</td>
                      <td className="px-6 py-4 whitespace-nowrap">Data {row}-2</td>
                      <td className="px-6 py-4 whitespace-nowrap">Data {row}-3</td>
                      <td className="px-6 py-4 whitespace-nowrap">Data {row}-4</td>
                      <td className="px-6 py-4 whitespace-nowrap">Data {row}-5</td>
                      <td className="px-6 py-4 whitespace-nowrap">Data {row}-6</td>
                      <td className="px-6 py-4 whitespace-nowrap">Data {row}-7</td>
                      <td className="px-6 py-4 whitespace-nowrap">Data {row}-8</td>
                      <td className="px-6 py-4 whitespace-nowrap">Data {row}-9</td>
                      <td className="px-6 py-4 whitespace-nowrap">Data {row}-10</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Demo 2: Wide Content Container */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Demo 2: Wide Content Container
          </h2>
          <p className="text-gray-600 mb-4">
            This is a wide content container that exceeds viewport width.
          </p>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div
              className="demo-scroll-container"
              style={{
                overflowX: 'scroll',
                overflowY: 'visible',
                WebkitOverflowScrolling: 'touch',
                maxWidth: '100%',
                padding: '20px'
              }}
            >
              <div
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg p-8 text-white"
                style={{ minWidth: '1500px' }}
              >
                <h3 className="text-2xl font-bold mb-4">Wide Content Area</h3>
                <p className="text-lg">
                  This content is 1500px wide and will require horizontal scrolling.
                  The scrollbar thumb should be visible and draggable at the bottom of this container.
                </p>
                <div className="mt-4 grid grid-cols-6 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <div key={num} className="bg-white/20 p-4 rounded text-center">
                      Box {num}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo 3: Instructions */}
        <section className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Testing Instructions
          </h2>
          <ul className="space-y-2 text-blue-800">
            <li>✓ <strong>Scrollbar Track:</strong> You should see a light gray track at the bottom of each scrollable area</li>
            <li>✓ <strong>Scrollbar Thumb:</strong> A medium gray, draggable thumb should be visible inside the track</li>
            <li>✓ <strong>Hover Effect:</strong> The thumb should darken when you hover over it</li>
            <li>✓ <strong>Drag to Scroll:</strong> You should be able to drag the thumb left/right to scroll</li>
            <li>✓ <strong>Minimum Size:</strong> The thumb has a minimum width of 30px for visibility</li>
            <li>✓ <strong>Browser Resize:</strong> Try resizing your browser window - the scrollbar should remain visible when needed</li>
          </ul>
        </section>

        {/* Demo 4: Prominent Test Component */}
        <HorizontalScrollTest />

        {/* Demo 5: Technical Details */}
        <section className="bg-gray-50 p-6 rounded">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Technical Implementation
          </h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-lg mb-2">CSS Applied:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Scrollbar height: 16px</li>
                <li>Thumb minimum width: 30px (CRITICAL for visibility)</li>
                <li>Table width: max-content with minWidth: 1200px</li>
                <li>Container: overflow-x: scroll (forces scrollbar to always show)</li>
                <li>Cross-browser support: WebKit + Firefox properties</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Files Updated:</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>src/components/ui/DataTable.tsx</li>
                <li>src/app/admin/events/dashboard/EventDashboardClient.tsx</li>
                <li>src/app/admin/events/registrations/RegistrationManagementClient.tsx</li>
                <li>src/app/globals.css (global scrollbar styling)</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
