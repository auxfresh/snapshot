
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

exports.handler = async (event, context) => {
  const { httpMethod, path, body, queryStringParameters } = event;
  const route = path.replace('/.netlify/functions/api', '');

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    let parsedBody = {};
    if (body) {
      parsedBody = JSON.parse(body);
    }

    // Screenshot capture endpoint
    if (route === '/screenshots/capture' && httpMethod === 'POST') {
      const { url, deviceType, backgroundColor, frameStyle, frameColor } = parsedBody;
      
      const apiKey = process.env.SCREENSHOTONE_API_KEY;
      if (!apiKey) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ message: 'API key not configured' })
        };
      }

      const screenshotParams = new URLSearchParams({
        access_key: apiKey,
        url: url,
        viewport_width: deviceType === 'mobile' ? '375' : '1920',
        viewport_height: deviceType === 'mobile' ? '667' : '1080',
        device_scale_factor: '2',
        format: 'png',
        block_ads: 'true',
        block_cookie_banners: 'true',
        delay: '3',
        timeout: '30',
      });

      const screenshotUrl = `https://api.screenshotone.com/take?${screenshotParams.toString()}`;
      const title = new URL(url).hostname.replace('www.', '');

      // Save to database (without user association for serverless)
      const result = await sql`
        INSERT INTO screenshots (user_id, url, title, device_type, background_color, frame_style, frame_color, screenshot_url)
        VALUES (1, ${url}, ${title}, ${deviceType}, ${backgroundColor}, ${frameStyle}, ${frameColor}, ${screenshotUrl})
        RETURNING *
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result[0])
      };
    }

    // Get screenshots endpoint
    if (route === '/screenshots' && httpMethod === 'GET') {
      const limit = queryStringParameters?.limit ? parseInt(queryStringParameters.limit) : 10;
      
      const screenshots = await sql`
        SELECT * FROM screenshots 
        ORDER BY created_at DESC 
        LIMIT ${limit}
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(screenshots)
      };
    }

    // Default response
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found' })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message })
    };
  }
};
