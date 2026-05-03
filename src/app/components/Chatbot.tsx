import { useState, useRef, useEffect } from "react";
import { Send, X, Bot, User, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { chatApi } from "@/app/services/api";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
}

export function Chatbot({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Hi! I'm your AI financial advisor. How can I help you optimize your expenses today?",
      sender: "bot"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = { id: Date.now().toString(), text: input.trim(), sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage({ message: userMessage.text });
      const botMessage: Message = { id: Date.now().toString() + "-bot", text: response.reply, sender: "bot" };
      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage: Message = { 
        id: Date.now().toString() + "-error", 
        text: error.message || "Sorry, I'm having trouble connecting right now. Please check if your GEMINI_API_KEY is configured correctly.", 
        sender: "bot" 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-8 w-80 sm:w-96 h-[500px] max-h-[75vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col z-50 overflow-hidden transform transition-all">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-teal-500 to-emerald-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">AI Advisor</h3>
            <p className="text-white/80 text-xs">Always here to help</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-950 flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 max-w-[85%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : ""}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
              msg.sender === "user" ? "bg-teal-100 text-teal-600" : "bg-gradient-to-br from-teal-500 to-emerald-600 text-white"
            }`}>
              {msg.sender === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
            </div>
            <div className={`p-3 rounded-2xl text-sm ${
              msg.sender === "user" 
                ? "bg-teal-500 text-white rounded-tr-sm" 
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-sm prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900"
            }`}>
              {msg.sender === "user" ? (
                msg.text
              ) : (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-2 max-w-[85%]">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-3 h-3" />
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your expenses..."
            className="flex-1 bg-gray-100 dark:bg-gray-800 border-transparent focus:border-teal-500 focus:bg-white dark:focus:bg-gray-900 focus:ring-0 text-sm rounded-full px-4 py-2 text-gray-900 dark:text-gray-100 transition-colors outline-none border"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:dark:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
