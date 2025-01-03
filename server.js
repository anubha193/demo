const http = require('http');
const cors = require('cors');

// Create a CORS middleware function
const corsMiddleware = cors({
  origin: '*', // Allow all origins (you can change this to a specific domain if needed)
  methods: ['GET', 'POST'], // Allow GET and POST methods
  allowedHeaders: ['Content-Type', 'Authorization'] // Allow specific headers
});

const server = http.createServer((req, res) => {
  // Apply CORS headers to every request
  corsMiddleware(req, res, () => {
    // Get the client's IP address
    let clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;

    // If the X-Forwarded-For header contains multiple IPs, the first one is the real client IP
    if (clientIp && clientIp.indexOf(',') !== -1) {
      clientIp = clientIp.split(',')[0];
    }

    console.log(`Client IP Address: ${clientIp}`);

    if (req.method === 'POST') {
      let body = '';

      // Collect the incoming data
      req.on('data', chunk => {
        body += chunk.toString(); // Convert Buffer to string
      });

      // Once all data is received
      req.on('end', () => {
        console.log(`Received request body: ${body}`);

        // Parse the JSON if the content type is JSON
        let responseBody;
        try {
          responseBody = JSON.parse(body);
        } catch (err) {
          responseBody = { error: 'Invalid JSON' };
        }

        // Set the response headers and send a response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', received: responseBody }));
      });
    } else {
      // If the request is not POST
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
    }
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
