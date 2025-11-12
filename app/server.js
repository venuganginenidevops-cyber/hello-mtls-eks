const fs = require('fs');
const https = require('https');
const express = require('express');

const app = express();
app.get('/', (req, res) => {
  res.send('Hello World from mTLS-secured app on Kubernetes!');
});

const options = {
  key: fs.readFileSync('/etc/certs/tls.key'),
  cert: fs.readFileSync('/etc/certs/tls.crt'),
  ca: fs.readFileSync('/etc/certs/ca.crt'),
  requestCert: true,
  rejectUnauthorized: true,
};

https.createServer(options, app).listen(8443, () => {
  console.log('Server running on port 8443 with mutual TLS');
});
