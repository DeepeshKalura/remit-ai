// Rationale: 
// 1. Encapsulates the API logic.
// 2. Maps TypeScript interfaces directly to your Python Pydantic models.
// 3. Handles the backend URL via environment variables cleanly.

// Types matching your Python Backend schemas
export interface ChatRequest {
  conversation_id: string;
  user_id: number;
  message: string;
  context?: Record<string, any>;
}

export interface ChatResponse {
  response: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

export class ChatClient {
  async sendMessage(message: string, userId: number = 99): Promise<string> {
    try {
      const payload: ChatRequest = {
        conversation_id: "default", // Can be dynamic later
        user_id: userId,            // Matching your mock user ID 99 in backend
        message: message,
        context: {
          source: "web_dashboard"
        }
      };

      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error(`API Error: ${res.status} ${res.statusText}`);
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }

      // Check if the response is a stream
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("text/event-stream")) {
        // If it's a stream, we can't just return a string. 
        // But for backward compatibility or if the backend supports both, we might want to handle it.
        // However, the current backend implementation ONLY returns a stream.
        // So this existing sendMessage method will likely break or needs to be updated to consume the stream and return the full text.
        // Let's consume the stream fully and return the result for this method.
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                fullResponse += line.slice(6);
              }
            }
          }
        }
        return fullResponse;
      }

      const data: ChatResponse = await res.json();
      return data.response;

    } catch (error) {
      console.error("[ChatClient] Error:", error);
      throw error; // Re-throw to handle it in the UI
    }
  }

  async streamMessage(
    message: string,
    onChunk: (chunk: string) => void,
    userId: number = 99
  ): Promise<void> {
    try {
      const payload: ChatRequest = {
        conversation_id: "default",
        user_id: userId,
        message: message,
        context: {
          source: "web_dashboard"
        }
      };

      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Response body is null");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data) onChunk(data);
          }
        }
      }

    } catch (error) {
      console.error("[ChatClient] Stream Error:", error);
      throw error;
    }
  }
}

export const chatClient = new ChatClient();

