// OYA Portraits — IUCN Red List API proxy
// The IUCN token lives here on the server as a Netlify environment variable.
// Client-side JavaScript calls /.netlify/functions/iucn-proxy?endpoint=...
// This function adds the token and forwards the request to the IUCN v4 API.

const https = require('https');

exports.handler = async (event) => {
  const token = process.env.IUCN_TOKEN;

  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'IUCN token not configured on server' })
    };
  }

  const endpoint = (event.queryStringParameters && event.queryStringParameters.endpoint) || '';
  if (!endpoint) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'No API endpoint specified' })
    };
  }

  // Only allow requests to the IUCN v4 API — prevent misuse
  const allowedPrefix = 'taxa/';
  if (!endpoint.startsWith(allowedPrefix)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Endpoint not permitted' })
    };
  }

  const url = `https://api.iucnredlist.org/api/v4/${endpoint}`;

  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: err.message })
      });
    });
  });
};
