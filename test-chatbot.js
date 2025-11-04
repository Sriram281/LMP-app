// Simple test script to verify chatbot functionality
import { request } from 'http';

const data = JSON.stringify({
  message: 'What courses are available?'
});

const options = {
  hostname: 'localhost',
  port: 3003, // Changed to 3003 to match the server
  path: '/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = request(options, res => {
  console.log(`Status: ${res.statusCode}`);
  
  let responseData = '';
  
  res.on('data', chunk => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', responseData);
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

req.write(data);
req.end();