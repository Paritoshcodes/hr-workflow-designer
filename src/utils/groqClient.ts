const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'

interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface GroqChoice {
  message: { content: string }
  index: number
  finish_reason: string
}

interface GroqResponse {
  choices: GroqChoice[]
  model: string
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
}

interface CallGroqOptions {
  temperature?: number
  maxTokens?: number
}

function getApiKey(): string {
  const key = import.meta.env.VITE_GROQ_API_KEY as string | undefined
  if (!key) {
    throw new Error('Set VITE_GROQ_API_KEY in .env.local to use AI features')
  }
  return key
}

function buildMessages(systemPrompt: string, userPrompt: string): GroqMessage[] {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]
}

/**
 * Non-streaming call to Groq. Returns the assistant's response as a string.
 */
export async function callGroq(
  systemPrompt: string,
  userPrompt: string,
  options: CallGroqOptions = {}
): Promise<string> {
  const apiKey = getApiKey()

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: buildMessages(systemPrompt, userPrompt),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`Groq request failed (${response.status}): ${errorBody}`)
  }

  let result: GroqResponse
  try {
    result = (await response.json()) as GroqResponse
  } catch {
    throw new Error('Groq returned an invalid JSON response')
  }

  const content = result.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('Groq returned an empty response')
  }

  return content
}

/**
 * Streaming call to Groq. Calls onChunk for each token as it arrives.
 * Used for the simulation narrator's token-by-token streaming.
 */
export async function callGroqStream(
  systemPrompt: string,
  userPrompt: string,
  onChunk: (text: string) => void
): Promise<void> {
  const apiKey = getApiKey()

  const response = await fetch(GROQ_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: buildMessages(systemPrompt, userPrompt),
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`Groq streaming request failed (${response.status}): ${errorBody}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Response body is not readable')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      // Keep the last potentially incomplete line in the buffer
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()

        if (!trimmed || !trimmed.startsWith('data: ')) continue
        const payload = trimmed.slice(6) // Remove 'data: ' prefix

        if (payload === '[DONE]') return

        try {
          const chunk = JSON.parse(payload) as {
            choices: Array<{ delta: { content?: string } }>
          }
          const deltaContent = chunk.choices?.[0]?.delta?.content
          if (deltaContent) {
            onChunk(deltaContent)
          }
        } catch {
          // Skip malformed SSE chunks silently
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
