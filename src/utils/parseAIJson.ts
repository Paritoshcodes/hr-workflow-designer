/**
 * Safely parse JSON from an AI response that may include markdown code fences.
 * Handles cases where the model wraps output in ```json ... ``` blocks.
 * Returns null if parsing fails.
 */
export function parseAIJson<T>(raw: string): T | null {
  try {
    // Strip markdown fences if present (```json ... ``` or ``` ... ```)
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim()

    // Also handle cases where JSON is embedded within other text
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      // Try parsing the cleaned text directly (might be a plain JSON string)
      return JSON.parse(cleaned) as T
    }

    const jsonSlice = cleaned.slice(firstBrace, lastBrace + 1)
    return JSON.parse(jsonSlice) as T
  } catch {
    console.error('Failed to parse AI JSON response:', raw.slice(0, 500))
    return null
  }
}
