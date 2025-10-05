import axios from 'axios';

// Test CamPay connectivity
async function testCamPayConnectivity() {
  const endpoints = [
    'https://campay.net/api/token/',
    'https://api.campay.net/token/',
    'https://www.campay.net/api/token/'
  ];

  const credentials = {
    username: "JByBUneb4BceuEyoMu1nKlmyTgVomd-QfokOrs4t4B9tPJS7hhqUtpuxOx5EQ7zpT0xmYw3P6DU6LU0mH2DvaQ",
    password: "m-Xuj9EQIT_zeQ5hSn8hLjYlyJT7KnSTHABYVp7tKeHKgsVnF0x6PEcdtZCVaDM0BN5mX-eylX0fhrGGMZBrWg"
  };

  console.log('🔍 Testing CamPay API connectivity...\n');

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      
      const response = await axios.post(endpoint, credentials, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SmartBite-Test/1.0'
        }
      });

      console.log(`✅ SUCCESS: ${endpoint}`);
      console.log(`Response:`, response.data);
      console.log('---\n');
      
      return { endpoint, token: response.data.token };
    } catch (error) {
      console.log(`❌ FAILED: ${endpoint}`);
      console.log(`Error: ${error.message}`);
      if (error.response?.data) {
        console.log(`Response:`, error.response.data);
      }
      console.log('---\n');
    }
  }

  throw new Error('All CamPay endpoints failed');
}

// Run the test
testCamPayConnectivity()
  .then(result => {
    console.log('🎉 CamPay connectivity test completed successfully!');
    console.log(`Working endpoint: ${result.endpoint}`);
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 All CamPay endpoints failed:', error.message);
    process.exit(1);
  });