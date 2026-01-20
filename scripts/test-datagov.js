#!/usr/bin/env node
const apiKey = process.env.DATAGOV_API_KEY || process.env.NEXT_PUBLIC_DATAGOV_API_KEY || null;
const q = process.argv[2] || 'water';
const rows = process.argv[3] || '5';
const url = `https://catalog.data.gov/api/3/action/package_search?q=${encodeURIComponent(q)}&rows=${rows}`;

console.log('Query:', q);
console.log('URL:', url);
if (apiKey) console.log('Using DATAGOV_API_KEY from environment');

;(async () => {
  if (typeof fetch === 'undefined') {
    console.error('global fetch is not available — Node v18+ required');
    process.exit(2);
  }

  try {
    const headers = {};
    if (apiKey) headers['X-API-Key'] = apiKey;
    const res = await fetch(url, { headers });
    console.log('HTTP status:', res.status);
    const json = await res.json();
    const count = json && json.result && typeof json.result.count !== 'undefined' ? json.result.count : (json && json.result && json.result.results ? json.result.results.length : null);
    console.log('Result count:', count);
    if (json && json.result && Array.isArray(json.result.results) && json.result.results.length > 0) {
      console.log('First result title:', json.result.results[0].title);
    } else {
      console.log('No results returned');
    }
  } catch (err) {
    console.error('Fetch error:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
