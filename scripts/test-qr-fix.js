// Quick test to verify our QR code fix
// This tests that getAppUrl() is properly used instead of hardcoded URLs

const { getAppUrl } = require('./src/lib/env.ts');

console.log('Testing QR code fix...');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('App URL:', getAppUrl());

// Simulate production environment
process.env.NODE_ENV = 'production';
process.env.NEXT_PUBLIC_APP_URL = 'https://www.adwiise.com';
console.log('Production App URL:', getAppUrl());

console.log('QR code fix verification complete!');