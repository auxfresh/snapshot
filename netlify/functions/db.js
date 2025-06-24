import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../../shared/schema.js';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql, { schema });

export default async (event, context) => {
  try {
    // Handle your API routes here
    const path = event.path;
    const method = event.httpMethod;

    // You'd need to manually implement all your Express routes here
    // This is a basic example structure

    if (path.startsWith('/api/screenshots') && method === 'GET') {
      const screenshots = await db.select().from(schema.screenshots);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(screenshots)
      };
    }

    return {
      statusCode: 404,
      body: 'Not Found'
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};