import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AIChatbot() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    // Load messages from localStorage on component mount
    if (typeof window !== 'undefined') {
      const savedUserId = localStorage.getItem('current_user_id');
      if (savedUserId) {
        const savedMessages = localStorage.getItem(`chatbot_messages_${savedUserId}`);
        if (savedMessages) {
          try {
            const parsedMessages = JSON.parse(savedMessages);
            // Convert timestamp strings back to Date objects
            return parsedMessages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
          } catch (e) {
            console.error('Failed to parse saved messages', e);
          }
        }
      }
    }
    // Default welcome message
    return [
      {
        id: '1',
        text: 'Hello! I\'m your AI assistant. How can I help you today?',
        sender: 'ai',
        timestamp: new Date(),
      }
    ];
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save current user ID and messages to localStorage
  useEffect(() => {
    if (user) {
      // Save current user ID
      localStorage.setItem('current_user_id', user.id);
      // Save messages
      localStorage.setItem(`chatbot_messages_${user.id}`, JSON.stringify(messages));
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
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(messagesWithDates);
        } catch (e) {
          console.error('Failed to parse saved messages', e);
          // Reset to welcome message on error
          setMessages([
            {
              id: '1',
              text: 'Hello! I\'m your AI assistant. How can I help you today?',
              sender: 'ai',
              timestamp: new Date(),
            }
          ]);
        }
      } else {
        // No saved messages, use welcome message
        setMessages([
          {
            id: '1',
            text: 'Hello! I\'m your AI assistant. How can I help you today?',
            sender: 'ai',
            timestamp: new Date(),
          }
        ]);
      }
    } else {
      // No user, clear messages but keep welcome message
      setMessages([
        {
          id: '1',
          text: 'Hello! I\'m your AI assistant. How can I help you today?',
          sender: 'ai',
          timestamp: new Date(),
        }
      ]);
    }
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatResponse = (text: string) => {
    // Remove extra asterisks and clean up formatting
    return text
      .replace(/<s>/g, '')        // Remove <s> tags
      .replace(/<\/s>/g, '')      // Remove </s> tags
      .replace(/\[\/?s\]/g, '')   // Remove [s] and [/s] tags
      .replace(/\*\*/g, '')       // Remove bold markers
      .replace(/\*/g, '')         // Remove italic markers
      .replace(/\\n/g, '\n')      // Convert escaped newlines
      .trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    
    try {
      // Call OpenRouter API
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer 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`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct:free',
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant for an admin dashboard application. Provide concise, accurate responses. Do not use markdown formatting like ** or *. Use plain text with clear line breaks for lists and structure. Do not include special tokens like <s> or [/s].' },
            ...messages.filter(msg => msg.sender !== 'ai' || msg.id !== '1').map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text
            })),
            { role: 'user', content: inputText }
          ],
        }),

      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'Sorry, I couldn\'t process that request.';
      
      // Format the response to remove unwanted characters
      const formattedResponse = formatResponse(aiResponse);

      // Add AI message
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: formattedResponse,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
    //   setIsLoading(true);
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
      id: '1',
      text: 'Hello! I\'m your AI assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    if (user) {
      localStorage.setItem(`chatbot_messages_${user.id}`, JSON.stringify([welcomeMessage]));
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
                <h3 className="font-semibold text-gray-800 dark:text-white">AI Assistant</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
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
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
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