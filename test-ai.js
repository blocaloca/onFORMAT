// Quick test script to verify AI API is working
const apiKey = process.env.ANTHROPIC_API_KEY;

console.log('Testing AI API configuration...\n');
console.log('API Key exists:', !!apiKey);
console.log('API Key length:', apiKey?.length || 0);
console.log('API Key prefix:', apiKey?.substring(0, 20) || 'none');

if (!apiKey) {
  console.error('\n❌ ANTHROPIC_API_KEY not found in environment');
  process.exit(1);
}

// Test the API endpoint
async function testAI() {
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Say "test successful" if you can read this.',
          },
        ],
        toolType: 'LuxPixPro',
        aiMode: 'cinematographer',
        aiMood: 'cinematic',
        aiScale: 'full-crew',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ AI API TEST PASSED');
      console.log('Response:', data.message.substring(0, 100) + '...');
    } else {
      console.log('\n❌ AI API TEST FAILED');
      console.log('Error:', data.error);
    }
  } catch (error) {
    console.log('\n❌ AI API TEST FAILED');
    console.log('Error:', error.message);
  }
}

testAI();
