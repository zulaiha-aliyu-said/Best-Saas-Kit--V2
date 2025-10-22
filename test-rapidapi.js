/**
 * Quick test script to verify RapidAPI connection
 * Run with: node test-rapidapi.js
 */

// Manually set your API key here for testing
const RAPIDAPI_KEY = '55a39700c8mshda32b5dd89a9c6ap15c1acjsn042265ed7d33';

console.log('🔍 Testing RapidAPI Connection...\n');
console.log('🔑 API Key:', RAPIDAPI_KEY ? `${RAPIDAPI_KEY.slice(0, 10)}...${RAPIDAPI_KEY.slice(-10)}` : '❌ NOT SET');
console.log('');

// Test Twitter API
async function testTwitterAPI() {
  const userId = '44196397'; // Elon Musk
  const url = `https://twitter-api47.p.rapidapi.com/v3/user/tweets?userId=${userId}`;
  
  console.log('🐦 Testing Twitter API...');
  console.log('📡 URL:', url);
  console.log('');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'twitter-api47.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    });

    console.log('📊 Status:', response.status, response.statusText);
    console.log('');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      return false;
    }

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const firstTweet = data.data[0];
      console.log('✅ SUCCESS! Twitter API is working!');
      console.log('');
      console.log('📝 Sample Data:');
      console.log('   User:', firstTweet.author?.name);
      console.log('   Username:', firstTweet.author?.username);
      console.log('   Followers:', firstTweet.author?.followerCount?.toLocaleString());
      console.log('   Tweets fetched:', data.data.length);
      return true;
    } else {
      console.log('⚠️ No tweets returned. Full response:');
      console.log(JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('1. Check RAPIDAPI_KEY is correct');
    console.error('2. Verify your RapidAPI subscription is active');
    console.error('3. Check you have credits/quota remaining');
    console.error('4. Visit: https://rapidapi.com/hub');
    return false;
  }
}

// Test Instagram API
async function testInstagramAPI() {
  const username = 'natgeo';
  const url = `https://instagram-profile1.p.rapidapi.com/getprofile/${username}`;
  
  console.log('');
  console.log('📸 Testing Instagram API...');
  console.log('📡 URL:', url);
  console.log('');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'instagram-profile1.p.rapidapi.com',
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    });

    console.log('📊 Status:', response.status, response.statusText);
    console.log('');

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:', errorText);
      return false;
    }

    const data = await response.json();
    
    if (data.username) {
      console.log('✅ SUCCESS! Instagram API is working!');
      console.log('');
      console.log('📝 Sample Data:');
      console.log('   Name:', data.full_name);
      console.log('   Username:', data.username);
      console.log('   Followers:', data.followers?.toLocaleString());
      console.log('   Posts:', data.lastMedia?.media?.length || 0);
      return true;
    } else {
      console.log('⚠️ Unexpected data structure:');
      console.log(JSON.stringify(data, null, 2));
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  if (!RAPIDAPI_KEY) {
    console.error('❌ RAPIDAPI_KEY not set!');
    console.error('Edit test-rapidapi.js and set your API key');
    process.exit(1);
  }

  const twitterOk = await testTwitterAPI();
  const instagramOk = await testInstagramAPI();
  
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('📊 Test Results:');
  console.log('   Twitter API:', twitterOk ? '✅ WORKING' : '❌ FAILED');
  console.log('   Instagram API:', instagramOk ? '✅ WORKING' : '❌ FAILED');
  console.log('═══════════════════════════════════════');
  console.log('');

  if (twitterOk && instagramOk) {
    console.log('🎉 All tests passed! Your API is ready to use.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Restart your Next.js dev server');
    console.log('2. Go to http://localhost:3000/dashboard/competitors');
    console.log('3. Try adding a competitor!');
  } else {
    console.log('⚠️ Some tests failed. Please check:');
    console.log('1. RapidAPI subscription is active');
    console.log('2. API quota/credits are available');
    console.log('3. API endpoints are correct');
    console.log('');
    console.log('Visit your RapidAPI dashboard:');
    console.log('https://rapidapi.com/developer/dashboard');
  }
}

runTests();
