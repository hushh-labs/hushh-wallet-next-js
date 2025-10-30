export async function GET() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || 'dev';
  const branch = process.env.VERCEL_GIT_COMMIT_REF || 'unknown';
  const message = process.env.VERCEL_GIT_COMMIT_MESSAGE || 'unknown';
  
  return new Response(JSON.stringify({ 
    sha,
    branch,
    message,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  }), { 
    headers: { 
      'content-type': 'application/json',
      'cache-control': 'no-store, no-cache, must-revalidate'
    }
  });
}
