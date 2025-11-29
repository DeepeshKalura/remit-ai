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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export class ChatClient {
  async sendMessage(message: string, userId: number = 99): Promise<string> {
    try {
      const payload: ChatRequest = {
        conversation_id: "default", // Can be dynamic later
        user_id: userId,            // Matching your mock user ID 99 in backend
        message: message,
        context: {
          // Add any frontend context here if needed (e.g., current page)
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

      const data: ChatResponse = await res.json();
      return data.response;

    } catch (error) {
      console.error("[ChatClient] Error:", error);
      throw error; // Re-throw to handle it in the UI
    }
  }
}

export const chatClient = new ChatClient();