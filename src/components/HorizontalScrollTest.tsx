'use client';

/**
 * HorizontalScrollTest Component
 *
 * A visual test component to verify horizontal scrollbar thumb visibility.
 * Add this component at the bottom of any page to test scrollbar functionality.
 */
export default function HorizontalScrollTest() {
  return (
    <div className="w-full py-8 bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          🔍 Horizontal Scrollbar Test
        </h3>

        <style dangerouslySetInnerHTML={{
          __html: `
            .horizontal-scroll-test-container {
              overflow-x: scroll !important;
              overflow-y: visible !important;
              scrollbar-width: thin !important;
              scrollbar-color: #3B82F6 #E0E7FF !important;
              -ms-overflow-style: -ms-autohiding-scrollbar !important;
            }
            .horizontal-scroll-test-container::-webkit-scrollbar {
              height: 20px !important;
              display: block !important;
              -webkit-appearance: none !important;
              appearance: none !important;
            }
            .horizontal-scroll-test-container::-webkit-scrollbar-track {
              background: #E0E7FF !important;
              border-radius: 10px !important;
              -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.15) !important;
              box-shadow: inset 0 0 6px rgba(0,0,0,0.15) !important;
            }
            .horizontal-scroll-test-container::-webkit-scrollbar-thumb {
              background: linear-gradient(90deg, #3B82F6, #8B5CF6) !important;
              border-radius: 10px !important;
              border: 4px solid #E0E7FF !important;
              -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.4) !important;
              box-shadow: inset 0 0 6px rgba(0,0,0,0.4) !important;
              min-width: 50px !important;
              background-clip: padding-box !important;
            }
            .horizontal-scroll-test-container::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(90deg, #2563EB, #7C3AED) !important;
              border-color: #C7D2FE !important;
            }
            .horizontal-scroll-test-container::-webkit-scrollbar-thumb:active {
              background: linear-gradient(90deg, #1D4ED8, #6D28D9) !important;
              border-color: #A5B4FC !important;
            }
            .horizontal-scroll-test-container::-webkit-scrollbar-button {
              display: none !important;
            }
          `
        }} />

        <div className="bg-white rounded-lg shadow-lg border-2 border-blue-300 overflow-hidden">
          <div
            className="horizontal-scroll-test-container"
            style={{
              overflowX: 'scroll',
              overflowY: 'visible',
              WebkitOverflowScrolling: 'touch',
              maxWidth: '100%',
              padding: '20px',
              display: 'block'
            }}
          >
            <div
              className="bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-orange-500 rounded-lg p-6"
              style={{ minWidth: '2000px', paddingRight: '100vw' }}
            >
              <div className="text-white space-y-4">
                <h4 className="text-2xl font-bold">
                  ✅ Horizontal Scrollbar Visibility Test
                </h4>
                <p className="text-lg">
                  This content is <strong>2000px wide</strong> - you MUST see a horizontal scrollbar below with a visible BLUE-PURPLE gradient thumb.
                </p>
                <div className="grid grid-cols-10 gap-4 mt-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <div
                      key={num}
                      className="bg-white/20 backdrop-blur-sm p-4 rounded-lg text-center font-bold text-xl"
                    >
                      {num}
                    </div>
                  ))}
                </div>
                <div className="bg-yellow-400 text-gray-900 p-4 rounded-lg mt-6 font-semibold">
                  👉 LOOK BELOW: You should see a LARGE, COLORFUL scrollbar thumb (blue-purple gradient) that you can drag left/right!
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-blue-100 border-l-4 border-blue-600 p-4 rounded">
          <p className="text-sm text-blue-900">
            <strong>✓ Expected:</strong> A prominent horizontal scrollbar with a blue-purple gradient thumb (50px minimum width) should be visible below the content area above.
          </p>
          <p className="text-sm text-blue-900 mt-2">
            <strong>✗ If you don't see it:</strong> The scrollbar styling might not be working in your browser or the content fits within the viewport.
          </p>
        </div>
      </div>
    </div>
  );
}
