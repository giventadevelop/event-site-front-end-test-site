// JWT Token Generation Test Script
// Tests if JWT token generation is working correctly

import { generateApiJwt } from '../src/lib/api/jwt';

async function testJwt() {
  console.log('='.repeat(80));
  console.log('JWT Token Generation Test');
  console.log('='.repeat(80));
  console.log('');

  try {
    console.log('[INFO] Attempting to generate JWT token...');
    const token = await generateApiJwt();

    console.log('[SUCCESS] JWT Token Generated!');
    console.log('');
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
    console.log('Token length:', token.length);
    console.log('');

    // Decode JWT to inspect payload (base64 decode the middle part)
    const parts = token.split('.');
    if (parts.length === 3) {
      console.log('[INFO] Decoding JWT payload...');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      console.log('');
      console.log('JWT Payload:');
      console.log(JSON.stringify(payload, null, 2));
      console.log('');

      // Check expiration
      if (payload.exp) {
        const expirationDate = new Date(payload.exp * 1000);
        console.log('[INFO] Token expires at:', expirationDate.toISOString());
        const minutesUntilExpiration = Math.floor((expirationDate.getTime() - Date.now()) / 1000 / 60);
        console.log('[INFO] Minutes until expiration:', minutesUntilExpiration);
      }
    } else {
      console.log('[ERROR] Invalid JWT format - expected 3 parts separated by dots');
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('[SUCCESS] JWT token generation is working correctly!');
    console.log('='.repeat(80));

  } catch (error) {
    console.log('');
    console.log('='.repeat(80));
    console.log('[ERROR] JWT Generation Failed!');
    console.log('='.repeat(80));
    console.error('');
    console.error('Error details:', error);
    console.error('');

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    console.log('');
    console.log('[TROUBLESHOOTING]');
    console.log('1. Check if API_JWT_USER and API_JWT_PASS are set in environment variables');
    console.log('2. Verify NEXT_PUBLIC_API_BASE_URL is correct');
    console.log('3. Ensure backend API is running and accessible');
    console.log('');

    process.exit(1);
  }
}

testJwt();
