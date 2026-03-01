import { useState } from "react";
import { X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Message = { role: "bot" | "user"; text: string };

const initialMessages: Message[] = [
  { role: "bot", text: "Hello! I'm your AI assistant. I can help with price suggestions, service guidance, and inventory optimization. How can I help?" },
];

export function AIChatPanel({ open, onClose }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, text: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "bot", text: getBotResponse(input) },
      ]);
    }, 800);
  };

  return (
    <div className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-card border-l border-border z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-border gradient-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          <span className="font-display font-semibold">AI Assistant</span>
        </div>
        <button onClick={onClose} className="hover:opacity-80"><X className="h-5 w-5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'bot' && (
              <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-foreground'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
          <Input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            placeholder="Ask about pricing, services..."
            className="flex-1"
          />
          <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
        </form>
      </div>
    </div>
  );
}

function getBotResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("price") || lower.includes("pricing")) {
    return "Based on current market trends, I'd suggest pricing brake pads between $25-45 and oil filters between $8-15. Premium brands can go 20-30% higher.";
  }
  if (lower.includes("service") || lower.includes("book")) {
    return "For engine diagnostics, the market rate is $50-100. I recommend offering package deals combining diagnostics with basic maintenance for better value.";
  }
  if (lower.includes("stock") || lower.includes("inventory")) {
    return "Your oil filters are running low (3 left). Based on your sales velocity, I recommend restocking within 2 days to avoid stockouts.";
  }
  return "I can help with pricing suggestions, service recommendations, inventory management, and market trends. What would you like to know more about?";
}
