// netlify/functions/proxy.ts
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import fetch from "node-fetch";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const targetUrl = event.queryStringParameters?.url;

  if (!targetUrl) {
    return {
      statusCode: 400,
      body: "URL parameter is required",
    };
  }

  try {
    const response = await fetch(targetUrl, {
      // Mimic a browser to avoid some simple blocks
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const body = await response.text();

    // Return the fetched content, but without the problematic security headers
    return {
      statusCode: response.status,
      body,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'text/html',
      },
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `Error fetching the URL: ${error.message}`,
    };
  }
};

export { handler };