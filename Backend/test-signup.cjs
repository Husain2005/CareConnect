const http = require('http');

const postData = JSON.stringify({
  name: "Test Patient",
  email: "patient123@test.com",
  password: "test123456",
  phone: "1234567890",
  role: "patient"
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/user/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(postData);
req.end();

console.log('Testing patient signup...');
