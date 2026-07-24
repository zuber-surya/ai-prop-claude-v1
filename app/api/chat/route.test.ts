import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Helper to create a mock Request with JSON body
function createMockRequest(body: any): Request {
  return new Request('https://example.com/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/chat', () => {
  const originalEnv = process.env
  const ANTHROPIC_API_KEY = 'test-anthropic-key'
  let routeModule: { POST: typeof import('./route')['POST'] }
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv }
    process.env.ANTHROPIC_API_KEY = ANTHROPIC_API_KEY
    // Clear mock calls and reset module cache
    vi.clearAllMocks()
    vi.resetModules()
    // Spy on console.error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env = originalEnv
    consoleErrorSpy.mockRestore()
  })

  async function importModule() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = await import('./route')
    return mod
  }

  it('returns 400 for missing message', async () => {
    const mod = await importModule()
    const request = createMockRequest({})
    const response = await mod.POST(request)
    const json = await response.json()
    expect(response.status).toBe(400)
    expect(json.error).toEqual({
      code: 'invalid_request',
      message: 'Message is required and must be a string',
    })
  })

  it('returns 400 for non-string message', async () => {
    const mod = await importModule()
    const request = createMockRequest({ message: 123 })
    const response = await mod.POST(request)
    const json = await response.json()
    expect(response.status).toBe(400)
    expect(json.error).toEqual({
      code: 'invalid_request',
      message: 'Message is required and must be a string',
    })
  })

  it('returns AI response on success', async () => {
    const mod = await importModule()
    // Mock fetch to return a successful response from Anthropic
    const mockResponse = {
      ok: true,
      json: async () => ({
        content: [{ text: 'Hello from Claude!' }],
      }),
    }
    ;(global.fetch as any) = vi.fn().mockResolvedValue(mockResponse)

    const request = createMockRequest({ message: 'Hi' })
    const response = await mod.POST(request)
    const json = await response.json()
    expect(response.status).toBe(200)
    expect(json).toEqual({ response: 'Hello from Claude!' })
    expect(global.fetch).toHaveBeenCalledWith('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        authorization: `Bearer ${ANTHROPIC_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1024,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    })
  })

  it('returns 503 with generic message when Anthropic API fails', async () => {
    const mod = await importModule()
    // Mock fetch to return a non-ok response (e.g., 500)
    const mockErrorResponse = {
      ok: false,
      json: async () => ({
        error: { message: 'Invalid API key' },
      }),
    }
    ;(global.fetch as any) = vi.fn().mockResolvedValue(mockErrorResponse)

    const request = createMockRequest({ message: 'Hi' })
    const response = await mod.POST(request)
    const json = await response.json()
    expect(response.status).toBe(503)
    expect(json.error).toEqual({
      code: 'ai_provider_error',
      message: 'Failed to get response from AI provider. Please try again later.',
    })
    // Ensure the error was logged
    expect(consoleErrorSpy).toHaveBeenCalledWith('Anthropic API error:', {
      error: { message: 'Invalid API key' },
    })
  })

  it('returns 500 on unexpected error', async () => {
    const mod = await importModule()
    // Mock fetch to throw an error
    ;(global.fetch as any) = vi.fn().mockRejectedValue(new Error('Network error'))

    const request = createMockRequest({ message: 'Hi' })
    const response = await mod.POST(request)
    const json = await response.json()
    expect(response.status).toBe(500)
    expect(json.error).toEqual({
      code: 'internal_error',
      message: 'An unexpected error occurred',
    })
  })

  it('rate limits after 5 requests', async () => {
    const mod = await importModule()
    // Mock fetch to always succeed
    const mockResponse = {
      ok: true,
      json: async () => ({
        content: [{ text: 'OK' }],
      }),
    }
    ;(global.fetch as any) = vi.fn().mockResolvedValue(mockResponse)

    // Make 5 requests
    for (let i = 0; i < 5; i++) {
      const request = createMockRequest({ message: `test${i}` })
      const response = await mod.POST(request)
      expect(response.status).toBe(200, `Request ${i + 1} should succeed`)
    }

    // 6th request should be rate limited
    const request = createMockRequest({ message: 'should be blocked' })
    const response = await mod.POST(request)
    expect(response.status).toBe(429)
    const json = await response.json()
    expect(json.error).toEqual({
      code: 'rate_limit_exceeded',
      message: 'Too many requests, please try again later.',
    })
    // Check for Retry-After header
    expect(response.headers.has('Retry-After')).toBe(true)
    const retryAfter = parseInt(response.headers.get('Retry-After') || '0', 10)
    expect(retryAfter).toBeGreaterThan(0)
  })
})