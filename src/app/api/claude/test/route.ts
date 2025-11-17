import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const claudeApiKey = process.env.CLAUDE_API_KEY;
    
    if (!claudeApiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'Claude API key not configured',
        configured: false
      }, { status: 503 });
    }

    // Test basic connectivity with a simple prompt
    const testPrompt = `You are a test endpoint for HUSHH. Respond with exactly this JSON:
{
  "status": "success",
  "message": "Claude API is working correctly",
  "timestamp": "${new Date().toISOString()}",
  "model": "claude-3-haiku-20240307"
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: testPrompt
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({
        status: 'error',
        message: `Claude API error: ${response.status} ${response.statusText}`,
        details: errorData,
        configured: true,
        connectivity: false
      }, { status: response.status });
    }

    const data = await response.json();
    const claudeResponse = data.content[0].text;

    // Try to parse Claude's response
    try {
      const parsed = JSON.parse(claudeResponse);
      
      return NextResponse.json({
        status: 'success',
        message: 'Claude API is fully functional',
        configured: true,
        connectivity: true,
        response: parsed,
        usage: {
          input_tokens: data.usage.input_tokens,
          output_tokens: data.usage.output_tokens
        }
      });
    } catch (parseError) {
      return NextResponse.json({
        status: 'warning',
        message: 'Claude API connected but response parsing failed',
        configured: true,
        connectivity: true,
        raw_response: claudeResponse,
        parse_error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      });
    }

  } catch (error) {
    console.error('Claude API test error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test Claude API connectivity',
      configured: !!process.env.CLAUDE_API_KEY,
      connectivity: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
