import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function AIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load messages from localStorage on component mount
    if (typeof window !== "undefined") {
      const savedUserId = localStorage.getItem("current_user_id");
      if (savedUserId) {
        const savedMessages = localStorage.getItem(
          `chatbot_messages_${savedUserId}`
        );
        if (savedMessages) {
          try {
            const parsedMessages = JSON.parse(savedMessages);
            // Convert timestamp strings back to Date objects
            return parsedMessages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }));
          } catch (e) {
            console.error("Failed to parse saved messages", e);
          }
        }
      }
    }
    // Default welcome message
    return [
      {
        id: "1",
        text: "Hello! I'm your AI assistant. How can I help you today?",
        sender: "ai",
        timestamp: new Date(),
      },
    ];
  });
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save current user ID and messages to localStorage
  useEffect(() => {
    if (user) {
      // Save current user ID
      localStorage.setItem("current_user_id", user.id);
      // Save messages
      localStorage.setItem(
        `chatbot_messages_${user.id}`,
        JSON.stringify(messages)
      );
    }
  }, [messages, user]);

  // Load messages when user changes
  useEffect(() => {
    if (user) {
      const savedMessages = localStorage.getItem(`chatbot_messages_${user.id}`);
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          // Convert timestamp strings back to Date objects
          const messagesWithDates = parsedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(messagesWithDates);
        } catch (e) {
          console.error("Failed to parse saved messages", e);
          // Reset to welcome message on error
          setMessages([
            {
              id: "1",
              text: "Hello! I'm your AI assistant. How can I help you today?",
              sender: "ai",
              timestamp: new Date(),
            },
          ]);
        }
      } else {
        // No saved messages, use welcome message
        setMessages([
          {
            id: "1",
            text: "Hello! I'm your AI assistant. How can I help you today?",
            sender: "ai",
            timestamp: new Date(),
          },
        ]);
      }
    } else {
      // No user, clear messages but keep welcome message
      setMessages([
        {
          id: "1",
          text: "Hello! I'm your AI assistant. How can I help you today?",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to generate humanized response using OpenRouter AI
  const generateHumanizedResponse = async (
    originalQuestion: string,
    rawData: string
  ) => {
    try {
      console.log("Generating humanized response with OpenRouter AI");
      console.log("Original question:", originalQuestion);
      console.log("Raw data:", rawData);

      // Get API key from environment variables
      const apiKey = import.meta.env.VITE_AI_API_KEY;
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        "https://openrouter.ai/api/v1/chat/completions";

      if (!apiKey) {
        throw new Error(
          "OpenRouter API key not found in environment variables"
        );
      }

      // Call OpenRouter API to generate humanized response
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "minimax/minimax-m2:free",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI assistant for a Learning Management System. Your task is to take raw database query results and create a natural, professional response to the user's original question. Format the response as clean HTML with basic inline CSS for styling. Use semantic HTML tags for proper structure.",
            },
            {
              role: "user",
              content: `Original question: "${originalQuestion}"

Raw database results: "${rawData}"

Please provide a natural, professional response to the original question based on the database results. Format your response as clean HTML. Follow these additional guidelines exactly:

1. OUTPUT STRUCTURE:
   - Wrap everything in a single container <div>.
   - Present only user-facing content (titles, names, descriptions, scores, course names, etc.) derived from the raw database results.
   - Do NOT include any system metadata or generated information such as:
     - id
     - created_at
     - updated_at
     - status
     - deleted_at
     - record id
     - created date

2. HTML & STYLING RULES:
   - Use only simple inline CSS (style="...") and semantic HTML tags such as <div>, <p>, <strong>, <br>, <ul>, <ol>, <li>, <h1>, <h2>.
   - For bold titles use <h2 style="font-weight:bold;margin-bottom:10px;"> or <strong>.
   - For alignment use text-align:center where appropriate.
   - Use margin-top and margin-bottom for spacing.
   - Do NOT use Tailwind, external CSS frameworks, or markdown.
   - Make sure every text or sentence in your final answer is included inside the HTML container.

3. DELIVERY:
   - Return only the HTML snippet as the assistant's reply (no extra JSON, no commentary).

4. EXAMPLE (for reference — do not include this example text in your final output):
<div>
  <h2 style="font-weight:bold;margin-bottom:10px;">Courses Found</h2>
  <p><strong>Course Title:</strong> Modern React with Hooks</p>
  <p><strong>Description:</strong> Learn the latest React features...</p>
</div>

Please produce the HTML response now.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(
          `OpenRouter API request failed with status ${response.status}`
        );
      }

      const data = await response.json();
      const humanizedResponse =
        data.choices[0]?.message?.content ||
        "I found some information that might help you.";

      console.log("Humanized response generated:", humanizedResponse);
      return humanizedResponse;
    } catch (error) {
      console.error("Error generating humanized response:", error);
      return `Based on your query, here's what I found:\n\n${rawData}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      console.log("Sending request to chat API with message:", inputText);

      // Send inputText directly to the backend
      const response = await fetch("http://localhost:3004/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputText }),
      });

      console.log(
        "Received response from chat API:",
        response.status,
        response.statusText
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Full response data from server:", data);

        // Log the AI generated query if it exists in the response
        if (data.query) {
          console.log("AI Generated Query:", data.query);
        }

        console.log("Data.reply : ", data.reply);

        let aiMessage: Message = {
          id: "",
          text: "",
          sender: "user",
          timestamp: new Date(),
        };
        if (!data.query || (data && data?.length === 0)) {
          aiMessage = {
            id: Date.now().toString(),
            text: data.reply,
            sender: "ai",
            timestamp: new Date(),
          };
        } else {
          const humanizedResponse = await generateHumanizedResponse(
            inputText,
            data.reply
          );
          aiMessage = {
            id: Date.now().toString(),
            text: humanizedResponse,
            sender: "ai",
            timestamp: new Date(),
          };
        }

        // Generate humanized response using OpenRouter AI

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        console.error("Server returned error status:", response.status);
        const errorMessage: Message = {
          id: Date.now().toString(),
          text: "Sorry, I encountered an error processing your request.",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error communicating with chat API:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, I'm having trouble connecting to the server.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const clearChat = () => {
    const welcomeMessage: Message = {
      id: "1",
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    if (user) {
      localStorage.setItem(
        `chatbot_messages_${user.id}`,
        JSON.stringify([welcomeMessage])
      );
    }
  };

  return (
    <>
      {/* Chatbot Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 z-50"
        aria-label="Toggle chatbot"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-md h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  AI Assistant
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Online
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearChat}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-xs"
                aria-label="Clear chat"
              >
                Clear
              </button>
              <button
                onClick={closeChat}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {message.sender === "ai" ? (
                    <div
                      className="whitespace-normal"
                      dangerouslySetInnerHTML={{ __html: message.text }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  )}
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-75"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-4 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
