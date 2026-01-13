async function testAPI() {
  try {
    console.log('🔍 Testing Anthropic API connection...\n');

    // Read API key directly from .env.local
    const fs = require('fs');
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const apiKeyMatch = envContent.match(/ANTHROPIC_API_KEY=(.+)/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY not found in .env.local');
      return;
    }

    console.log('✓ API Key found:', apiKey.substring(0, 20) + '...');
    console.log('\n📡 Sending test request to Anthropic API...\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 100,
        messages: [{ role: 'user', content: 'Hello! Please respond with a simple greeting.' }]
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ API CONNECTION SUCCESSFUL!\n');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ API REQUEST FAILED\n');
      console.log('Status:', response.status);
      console.log('Error:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
  }
}

testAPI();
