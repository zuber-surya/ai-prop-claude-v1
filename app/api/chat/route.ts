import { NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

if (!ANTHROPIC_API_KEY) {
  throw new Error('Missing ANTHROPIC_API_KEY environment variable');
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: { code: 'invalid_request', message: 'Message is required and must be a string' } },
        { status: 400 }
      );
    }

    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        authorization: `Bearer ${ANTHROPIC_API_KEY}`
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620', // or latest available
        max_tokens: 1024,
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorData = await anthropicResponse.json();
      // Map Anthropic errors to our format
      return NextResponse.json(
        {
          error: {
            code: 'ai_provider_error',
            message: errorData.error?.message || 'Failed to get response from AI provider',
          },
        },
        { status: 503 }
      );
    }

    const data = await anthropicResponse.json();
    // Extract text from Claude's response
    const replyText = data.content?.[0]?.text ?? '';

    return NextResponse.json({ response: replyText });
  } catch (err) {
    console.error('Chat API error:', err);
    return NextResponse.json(
      { error: { code: 'internal_error', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}