export default function TestMobilePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Mobile Flow Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Test Mobile Detection</h2>
          <p className="mb-4">Use these links to test mobile flow detection:</p>
          
          <div className="space-y-2">
            <a 
              href="/api/test-mobile" 
              className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              target="_blank"
            >
              Test Current Device
            </a>
            
            <a 
              href="/api/test-mobile?width=400" 
              className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              target="_blank"
            >
              Simulate Mobile Screen Width (400px)
            </a>
            
            <a 
              href="/api/test-mobile?width=1920" 
              className="block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              target="_blank"
            >
              Simulate Desktop Screen Width (1920px)
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Test Payment Flow Scenarios</h2>
          <p className="mb-4">Test different payment completion scenarios:</p>
          
          <div className="space-y-2">
            <button 
              onClick={() => testPaymentScenario('cs_test_123', null)}
              className="block w-full bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 text-left"
            >
              Test with Session ID (cs_test_123)
            </button>
            
            <button 
              onClick={() => testPaymentScenario(null, 'pi_test_456')}
              className="block w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-left"
            >
              Test with Payment Intent (pi_test_456)
            </button>
            
            <button 
              onClick={() => testPaymentScenario('cs_mobile_789', null, 'mobile')}
              className="block w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-left"
            >
              Test Mobile User with Session ID
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Expected Mobile Flow</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>User completes Stripe payment</li>
            <li>Stripe redirects to /event/success with session_id or pi parameter</li>
            <li>Mobile detection triggers brief success message</li>
            <li>After 2 seconds, redirect to /event/ticket-qr with parameters</li>
            <li>QR code generation happens on dedicated QR page</li>
          </ol>
          
          <h3 className="text-xl font-semibold mt-6 mb-2">Expected Desktop Flow</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>User completes Stripe payment</li>
            <li>Stripe redirects to /event/success with session_id</li>
            <li>Desktop detection keeps user on success page</li>
            <li>Transaction data fetched and QR code generated inline</li>
            <li>Full success page displayed with integrated QR code</li>
          </ol>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          async function testPaymentScenario(session_id, pi, deviceType = 'desktop') {
            const userAgent = deviceType === 'mobile' 
              ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5_0 like Mac OS X) AppleWebKit/605.1.15'
              : navigator.userAgent;
              
            try {
              const response = await fetch('/api/test-mobile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  session_id,
                  pi,
                  userAgent
                })
              });
              
              const data = await response.json();
              console.log('Payment scenario test result:', data);
              alert('Check console for test results');
            } catch (error) {
              console.error('Test error:', error);
              alert('Test failed - check console');
            }
          }
        `
      }} />
    </div>
  );
}