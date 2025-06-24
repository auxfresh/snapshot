
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export const handler = async (event, context) => {
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

    // User authentication endpoints
    if (route === '/auth/sync-user' && httpMethod === 'POST') {
      const { firebaseUid, email, displayName, photoURL } = parsedBody;
      
      // Check if user exists
      let user = await sql`
        SELECT * FROM users WHERE firebase_uid = ${firebaseUid}
      `;
      
      if (user.length === 0) {
        // Create new user
        const newUser = await sql`
          INSERT INTO users (firebase_uid, email, display_name, photo_url)
          VALUES (${firebaseUid}, ${email}, ${displayName}, ${photoURL})
          RETURNING *
        `;
        
        // Create default preferences
        await sql`
          INSERT INTO user_preferences (user_id, default_device_type, default_background_color, default_frame_style, default_frame_color)
          VALUES (${newUser[0].id}, 'mobile', '#6366F1', 'framed', '#FFFFFF')
        `;
        
        user = newUser;
      } else {
        // Update existing user
        user = await sql`
          UPDATE users 
          SET email = ${email}, display_name = ${displayName}, photo_url = ${photoURL}
          WHERE firebase_uid = ${firebaseUid}
          RETURNING *
        `;
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(user[0])
      };
    }

    // Get user preferences
    if (route.startsWith('/users/') && route.endsWith('/preferences') && httpMethod === 'GET') {
      const firebaseUid = route.split('/')[2];
      
      const user = await sql`
        SELECT * FROM users WHERE firebase_uid = ${firebaseUid}
      `;
      
      if (user.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'User not found' })
        };
      }
      
      const preferences = await sql`
        SELECT * FROM user_preferences WHERE user_id = ${user[0].id}
      `;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(preferences[0] || {})
      };
    }

    // Update user preferences
    if (route.startsWith('/users/') && route.endsWith('/preferences') && httpMethod === 'PUT') {
      const firebaseUid = route.split('/')[2];
      const updates = parsedBody;
      
      const user = await sql`
        SELECT * FROM users WHERE firebase_uid = ${firebaseUid}
      `;
      
      if (user.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'User not found' })
        };
      }
      
      const preferences = await sql`
        UPDATE user_preferences 
        SET 
          default_device_type = COALESCE(${updates.defaultDeviceType}, default_device_type),
          default_background_color = COALESCE(${updates.defaultBackgroundColor}, default_background_color),
          default_frame_style = COALESCE(${updates.defaultFrameStyle}, default_frame_style),
          default_frame_color = COALESCE(${updates.defaultFrameColor}, default_frame_color)
        WHERE user_id = ${user[0].id}
        RETURNING *
      `;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(preferences[0])
      };
    }

    // Screenshot capture endpoint
    if (route === '/screenshots/capture' && httpMethod === 'POST') {
      const { url, deviceType, backgroundColor, frameStyle, frameColor, firebaseUid } = parsedBody;
      
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

      // Get user ID if authenticated
      let userId = 1;
      if (firebaseUid) {
        const user = await sql`
          SELECT * FROM users WHERE firebase_uid = ${firebaseUid}
        `;
        if (user.length > 0) {
          userId = user[0].id;
        }
      }

      // Save to database
      const result = await sql`
        INSERT INTO screenshots (user_id, url, title, device_type, background_color, frame_style, frame_color, screenshot_url)
        VALUES (${userId}, ${url}, ${title}, ${deviceType}, ${backgroundColor}, ${frameStyle}, ${frameColor}, ${screenshotUrl})
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
      const firebaseUid = queryStringParameters?.firebaseUid;
      
      let userId;
      if (firebaseUid) {
        const user = await sql`
          SELECT * FROM users WHERE firebase_uid = ${firebaseUid}
        `;
        userId = user.length > 0 ? user[0].id : undefined;
      }
      
      let screenshots;
      if (userId) {
        screenshots = await sql`
          SELECT * FROM screenshots 
          WHERE user_id = ${userId}
          ORDER BY created_at DESC 
          LIMIT ${limit}
        `;
      } else {
        screenshots = await sql`
          SELECT * FROM screenshots 
          ORDER BY created_at DESC 
          LIMIT ${limit}
        `;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(screenshots)
      };
    }

    // Get single screenshot
    if (route.startsWith('/screenshots/') && !route.includes('/download') && httpMethod === 'GET') {
      const id = parseInt(route.split('/')[2]);
      
      const screenshot = await sql`
        SELECT * FROM screenshots WHERE id = ${id}
      `;
      
      if (screenshot.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Screenshot not found' })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(screenshot[0])
      };
    }

    // Delete screenshot
    if (route.startsWith('/screenshots/') && !route.includes('/download') && httpMethod === 'DELETE') {
      const id = parseInt(route.split('/')[2]);
      
      await sql`
        DELETE FROM screenshots WHERE id = ${id}
      `;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Screenshot deleted successfully' })
      };
    }

    // Download screenshot endpoint
    if (route.startsWith('/screenshots/') && route.endsWith('/download') && httpMethod === 'GET') {
      const id = parseInt(route.split('/')[2]);
      
      const screenshot = await sql`
        SELECT * FROM screenshots WHERE id = ${id}
      `;
      
      if (screenshot.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Screenshot not found' })
        };
      }

      // For serverless functions, we can't stream binary data easily
      // Instead, redirect to the screenshot URL
      return {
        statusCode: 302,
        headers: {
          ...headers,
          'Location': screenshot[0].screenshot_url
        },
        body: ''
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
