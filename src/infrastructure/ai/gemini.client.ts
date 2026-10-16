import { BadGatewayError, TooManyRequestsError } from "../../shared/errors/app-error.js"

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
  error?: {
    message?: string
    code?: number
    status?: string
  }
}

export class GeminiClient {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
  ) {}

  async generateText(systemInstruction: string, userPrompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      }),
    })

    let body: GeminiGenerateContentResponse
    try {
      body = (await response.json()) as GeminiGenerateContentResponse
    } catch {
      throw new BadGatewayError("AI service returned an invalid response")
    }

    if (body.error || !response.ok) {
      const apiStatus = body.error?.status ?? ""
      const apiMessage = body.error?.message ?? ""

      if (response.status === 429 || apiStatus === "RESOURCE_EXHAUSTED") {
        throw new TooManyRequestsError("AI rate limit reached. Try again in a moment.")
      }

      if (response.status === 404 || apiStatus === "NOT_FOUND") {
        throw new BadGatewayError(
          `AI model "${this.model}" is unavailable. Set GEMINI_MODEL to a supported model (e.g. gemini-2.5-flash).`,
        )
      }

      if (response.status === 401 || response.status === 403 || apiStatus === "UNAUTHENTICATED") {
        throw new BadGatewayError("Invalid Gemini API key. Check GEMINI_API_KEY in server .env.")
      }

      if (process.env.NODE_ENV === "development" && apiMessage) {
        console.error("[gemini]", response.status, apiMessage)
      }

      throw new BadGatewayError("AI service failed to generate a problem draft")
    }

    const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? ""
    if (!text.trim()) {
      throw new BadGatewayError("AI returned an empty response")
    }

    return text
  }
}
