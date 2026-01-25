#!/usr/bin/env node

/**
 * Example script demonstrating API token usage
 * 
 * Usage:
 *   export EPLUR_API_TOKEN="your_token_here"
 *   export EPLUR_API_BASE="http://localhost:3000"
 *   node examples/test-api-token.js
 */

const API_TOKEN = process.env.EPLUR_API_TOKEN;
const API_BASE = process.env.EPLUR_API_BASE || 'http://localhost:3000';

if (!API_TOKEN) {
  console.error('Error: EPLUR_API_TOKEN environment variable not set');
  console.error('');
  console.error('To use this script:');
  console.error('  1. Create an API token at http://localhost:3000/settings');
  console.error('  2. Set the environment variable:');
  console.error('     export EPLUR_API_TOKEN="your_token_here"');
  console.error('  3. Run this script again');
  process.exit(1);
}

console.log('Testing API Token Authentication');
console.log('================================');
console.log(`API Base: ${API_BASE}`);
console.log(`Token: ${API_TOKEN.substring(0, 10)}...${API_TOKEN.substring(API_TOKEN.length - 10)}`);
console.log('');

async function testEndpoint(name, endpoint) {
  console.log(`Testing ${name}...`);
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`  Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`  Response: ${JSON.stringify(data).substring(0, 100)}...`);
      console.log('  ✓ Success');
    } else {
      const error = await response.text();
      console.log(`  Error: ${error.substring(0, 100)}`);
      console.log('  ✗ Failed');
    }
  } catch (error) {
    console.log(`  Error: ${error.message}`);
    console.log('  ✗ Failed');
  }
  console.log('');
}

async function main() {
  // Test token listing endpoint (should work with valid token)
  await testEndpoint('List API Tokens', '/api/user/tokens');
  
  // Test documents endpoint (may not have data but should authenticate)
  await testEndpoint('List Documents', '/api/documents');
  
  // Test graph endpoint
  await testEndpoint('Graph API', '/api/graph');
  
  console.log('Tests complete!');
  console.log('');
  console.log('If all tests show ✓ Success, your API token is working correctly.');
  console.log('If you see 401 Unauthorized errors, check that your token is valid.');
}

main();
