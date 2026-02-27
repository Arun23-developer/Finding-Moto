import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bot,
  Send,
  Sparkles,
  DollarSign,
  FileText,
  TrendingUp,
  Lightbulb,
  RotateCcw,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

// ─── Quick Action Suggestions ───────────────────────────────────────────────
const quickActions = [
  {
    icon: DollarSign,
    label: "Price Suggestion",
    prompt: "Suggest a competitive price for a Toyota Corolla brake pad set in the Sri Lankan market",
    color: "text-emerald-600",
    bg: "bg-emerald-600/10 hover:bg-emerald-600/20",
  },
  {
    icon: FileText,
    label: "Product Description",
    prompt: "Generate an engaging product description for an oil filter compatible with Honda Civic 2018-2024 models",
    color: "text-blue-600",
    bg: "bg-blue-600/10 hover:bg-blue-600/20",
  },
  {
    icon: TrendingUp,
    label: "Sales Tips",
    prompt: "Give me tips to increase sales for my spare parts shop on Finding Moto marketplace",
    color: "text-purple-600",
    bg: "bg-purple-600/10 hover:bg-purple-600/20",
  },
  {
    icon: Lightbulb,
    label: "Marketing Ideas",
    prompt: "Suggest marketing strategies to promote my automobile spare parts business in Sri Lanka",
    color: "text-amber-600",
    bg: "bg-amber-600/10 hover:bg-amber-600/20",
  },
];

// ─── Simulated AI Responses ─────────────────────────────────────────────────
const aiResponses: Record<string, string> = {
  price: `**Price Suggestion: Brake Pad Set - Toyota Corolla**

Based on current Sri Lankan market analysis:

📊 **Market Price Range:** LKR 3,500 - 6,500

**Recommended Pricing Strategy:**
- **Economy Option:** LKR 3,800 - 4,200 (Budget buyers)
- **Standard Option:** LKR 4,500 - 5,000 (Best value) ✅
- **Premium Option:** LKR 5,500 - 6,200 (OEM quality)

**Key Factors:**
• Average competitor price: LKR 4,800
• Import cost typically: LKR 2,200 - 3,000
• Healthy margin target: 35-45%

💡 **Tip:** Price at LKR 4,499 (psychological pricing) and offer free delivery for orders over LKR 5,000 to increase average order value.`,

  description: `**Product Description: Oil Filter - Honda Civic (2018-2024)**

---

🔧 **Premium Oil Filter for Honda Civic | OEM Quality Replacement**

Keep your Honda Civic running at peak performance with our premium oil filter, engineered specifically for 2018-2024 models. Featuring advanced multi-layer filtration technology, this filter captures 99% of harmful contaminants, protecting your engine from premature wear.

**Key Features:**
✅ Direct fit for Honda Civic 2018-2024 (1.5L Turbo & 2.0L)
✅ Anti-drainback valve prevents dry starts
✅ Heavy-duty metal housing for durability
✅ OEM-equivalent quality at an affordable price
✅ Easy installation - no special tools needed

**Specifications:**
- Thread Size: M20 x 1.5
- Height: 65mm | Outer Diameter: 68mm
- Change Interval: Every 10,000 km

📦 Fast island-wide delivery | 💯 Quality guaranteed

*Compatible: Honda Civic FC, FK (2018-2024)*`,

  tips: `**🚀 Top Sales Tips for Your Spare Parts Shop**

**1. Optimize Your Listings**
- Use high-quality product images (multiple angles)
- Include compatibility details (make, model, year)
- Add clear specifications and dimensions

**2. Competitive Pricing Strategy**
- Monitor competitor pricing weekly
- Offer bundle deals (e.g., "Brake pad + disc" combos)
- Run limited-time promotions

**3. Build Customer Trust**
- Respond to inquiries within 1 hour
- Ship orders within 24 hours
- Follow up after delivery for reviews

**4. Expand Your Range**
- Stock fast-moving items (filters, brake pads, belts)
- Add compatible parts for popular models in Sri Lanka
- Offer OEM and aftermarket options

**5. Leverage Finding Moto Features**
- Keep your shop profile complete and updated
- Use keywords in product titles
- Maintain a rating above 4.5 ⭐

📈 Sellers using these strategies see an average 35% increase in sales within 3 months.`,

  marketing: `**📢 Marketing Strategies for Your Auto Parts Business**

**Online Strategies:**
1. **Social Media Presence** - Post daily on Facebook & Instagram
   - Before/after installation photos
   - Quick tip videos (60 seconds)
   - Customer testimonials

2. **WhatsApp Business** - Create a product catalog
   - Send weekly promotions
   - Offer ordering via WhatsApp

3. **Google My Business** - List your shop with photos
   - Encourage reviews from happy customers

**Finding Moto Platform:**
- Run flash sales during weekends
- Offer "Buy 2, Get 10% off" bundles
- Maintain fast response times

**Customer Retention:**
- Loyalty discount for repeat buyers (5%)
- Birthday/anniversary discount vouchers
- Referral program: LKR 500 off for each referral

💡 **Quick Win:** Add "Compatible Vehicle" tags to all your products. This can increase your search visibility by 45%.`,
};

function getAIResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes("price") || lower.includes("pricing") || lower.includes("cost")) return aiResponses.price;
  if (lower.includes("description") || lower.includes("product") || lower.includes("write")) return aiResponses.description;
  if (lower.includes("tip") || lower.includes("sales") || lower.includes("increase")) return aiResponses.tips;
  if (lower.includes("market") || lower.includes("promote") || lower.includes("strateg")) return aiResponses.marketing;
  return `Great question! Here are some thoughts:\n\n${aiResponses.tips}\n\nFeel free to ask about **pricing suggestions**, **product descriptions**, or **marketing strategies** for more specific help!`;
}

// ─── AI Chat Page ───────────────────────────────────────────────────────────
export default function SellerAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: "assistant",
      text: "👋 Hello! I'm your AI sales assistant. I can help you with:\n\n• **Price suggestions** for your spare parts\n• **Product descriptions** that convert\n• **Sales tips** to boost your business\n• **Marketing strategies** for growth\n\nTry one of the quick actions below, or ask me anything!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = getAIResponse(text);
      const aiMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        text: "👋 Chat cleared! How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Sales Assistant</h1>
            <p className="text-sm text-muted-foreground">Powered by AI - Get smart suggestions for your business</p>
          </div>
        </div>
        <button
          onClick={resetChat}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
        >
          <RotateCcw className="h-4 w-4" /> New Chat
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Panel */}
        <div className="lg:col-span-3">
          <Card className="glass-card flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-muted rounded-bl-md"
                    )}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                        if (part.startsWith("**") && part.endsWith("**")) {
                          return <strong key={i}>{part.slice(2, -2)}</strong>;
                        }
                        return <span key={i}>{part}</span>;
                      })}
                    </div>
                    <p className={cn(
                      "text-[10px] mt-2 opacity-60",
                      msg.role === "user" ? "text-right" : ""
                    )}>
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-blue-600">You</span>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Quick Actions (shown when few messages) */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => sendMessage(action.prompt)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl text-left text-sm font-medium transition-all",
                        action.bg
                      )}
                    >
                      <action.icon className={cn("h-4 w-4", action.color)} />
                      <span>{action.label}</span>
                      <ChevronRight className="h-3 w-3 ml-auto opacity-50" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about pricing, descriptions, sales tips..."
                  disabled={isTyping}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/25"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                AI responses are for guidance only. Always verify pricing and details independently.
              </p>
            </div>
          </Card>
        </div>

        {/* Sidebar - Suggestions */}
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" /> Suggested Prompts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "What's a good price for NGK spark plugs?",
                "Write a description for a timing belt kit",
                "How to handle negative reviews?",
                "Best selling auto parts in Sri Lanka",
                "Tips for product photography",
                "How to write a return policy?",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => (
                <div key={action.label} className="flex items-start gap-2">
                  <action.icon className={cn("h-4 w-4 mt-0.5", action.color)} />
                  <div>
                    <p className="text-xs font-medium">{action.label}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {action.label === "Price Suggestion" && "Get competitive market pricing"}
                      {action.label === "Product Description" && "Auto-generate compelling copy"}
                      {action.label === "Sales Tips" && "Strategies to boost revenue"}
                      {action.label === "Marketing Ideas" && "Grow your customer base"}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
