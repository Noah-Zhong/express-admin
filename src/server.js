require('./main.js');
const app = require('./config/app.js');
const http = require('http');
const server = http.createServer(app);
const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || '3000';
server.listen(PORT, HOST, () => {
  console.log(`server running @ http://${HOST}:${PORT}`);
});
