import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userAgent = req.headers.get('user-agent') || '';
  
  // Mobile detection logic (same as SuccessClient)
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  // Simulate different screen widths for testing
  const testWidth = parseInt(searchParams.get('width') || '1920');
  const isNarrowScreen = testWidth <= 768;
  
  const isMobile = isMobileUserAgent || isNarrowScreen;
  
  const testResults = {
    timestamp: new Date().toISOString(),
    userAgent: userAgent,
    isMobileUserAgent: isMobileUserAgent,
    testWidth: testWidth,
    isNarrowScreen: isNarrowScreen,
    isMobile: isMobile,
    expectedFlow: isMobile ? 'mobile-redirect-to-qr-page' : 'desktop-integrated-success',
    mobileFlowSteps: isMobile ? [
      '1. Show brief success message',
      '2. Wait 2 seconds',
      '3. Redirect to /event/ticket-qr',
      '4. Generate QR code on dedicated page'
    ] : [
      '1. Stay on success page',
      '2. Fetch transaction data',
      '3. Generate QR code inline',
      '4. Display integrated success page'
    ]
  };
  
  console.log('[TEST MOBILE FLOW] Mobile flow test results:', JSON.stringify(testResults, null, 2));
  
  return NextResponse.json({
    message: 'Mobile flow test endpoint',
    results: testResults,
    testParams: {
      width: 'Add ?width=400 to test mobile screen width detection',
      example: `${req.url}?width=400`
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { session_id, pi, userAgent: providedUserAgent } = body;
    
    const userAgent = providedUserAgent || req.headers.get('user-agent') || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    const testScenario = {
      timestamp: new Date().toISOString(),
      providedData: { session_id, pi },
      userAgent: userAgent,
      isMobile: isMobile,
      expectedRedirectUrl: isMobile ? 
        (session_id ? `/event/ticket-qr?session_id=${session_id}` : `/event/ticket-qr?pi=${pi}`) :
        'No redirect - stay on success page',
      sessionStorageItems: isMobile ? 
        (session_id ? { stripe_session_id: session_id } : { stripe_payment_intent: pi }) :
        'Not used for desktop'
    };
    
    console.log('[TEST MOBILE FLOW POST] Testing payment flow scenario:', JSON.stringify(testScenario, null, 2));
    
    return NextResponse.json({
      message: 'Mobile flow scenario test',
      scenario: testScenario
    });
  } catch (error) {
    console.log('[TEST MOBILE FLOW POST] Error parsing request:', error);
    return NextResponse.json({
      message: 'Mobile flow test POST endpoint - error parsing body',
      error: String(error)
    });
  }
}