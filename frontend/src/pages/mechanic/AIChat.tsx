import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bot,
  Send,
  Sparkles,
  Wrench,
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
    icon: Wrench,
    label: "Repair Diagnosis",
    prompt: "Help me diagnose an engine overheating issue on a Honda CB150R motorcycle",
    color: "text-amber-600",
    bg: "bg-amber-600/10 hover:bg-amber-600/20",
  },
  {
    icon: FileText,
    label: "Service Quote",
    prompt: "Generate a service quote for a full motorcycle service including oil change, filter replacement, and chain adjustment",
    color: "text-blue-600",
    bg: "bg-blue-600/10 hover:bg-blue-600/20",
  },
  {
    icon: TrendingUp,
    label: "Business Tips",
    prompt: "Give me tips to grow my motorcycle repair workshop business in Sri Lanka",
    color: "text-purple-600",
    bg: "bg-purple-600/10 hover:bg-purple-600/20",
  },
  {
    icon: Lightbulb,
    label: "Technical Guide",
    prompt: "Explain the step-by-step process for replacing a motorcycle clutch kit",
    color: "text-emerald-600",
    bg: "bg-emerald-600/10 hover:bg-emerald-600/20",
  },
];

// ─── Simulated AI Responses ─────────────────────────────────────────────────
const aiResponses: Record<string, string> = {
  diagnosis: `**Diagnosis: Engine Overheating - Honda CB150R**

Based on your description, here are the likely causes:

🔍 **Common Causes:**

**1. Coolant System Issues**
- Low coolant level → Check and top up
- Faulty thermostat → Replace if stuck closed
- Leaking radiator hose → Inspect all connections

**2. Oil Related**
- Low engine oil → Check level and top up
- Old/degraded oil → Recommend full oil change
- Wrong oil viscosity → Use manufacturer-recommended grade

**3. Other Causes**
- Clogged radiator fins → Clean with compressed air
- Faulty water pump → Check for leaks/noise
- Head gasket issue → Check for white smoke/oil mixing

**Recommended Action Plan:**
1. ✅ Check coolant level and condition
2. ✅ Inspect engine oil level and quality
3. ✅ Test thermostat operation
4. ✅ Check fan operation
5. ✅ Pressure test cooling system

💡 **Estimated Repair Cost:** LKR 3,000 - 15,000 depending on the root cause.`,

  quote: `**Service Quote: Full Motorcycle Service**

---

🔧 **Workshop Service Estimate**

**Service Package: Complete Motorcycle Service**

| Item | Details | Cost (LKR) |
|------|---------|------------|
| Engine Oil Change | 10W-40 Synthetic (1L) | 1,800 |
| Oil Filter | OEM Compatible | 650 |
| Air Filter | Clean/Replace | 800 |
| Spark Plug | Iridium (1pc) | 450 |
| Chain Adjustment | Tension + Lubrication | 500 |
| Brake Inspection | Pad wear check + adjustment | 600 |
| General Inspection | 20-point safety check | 1,500 |
| Labour Charges | Flat rate | 2,500 |

**Total Estimate: LKR 8,800**

**Notes:**
- Additional parts charged separately if needed
- Estimated completion time: 2-3 hours
- 30-day warranty on all work performed

💡 **Tip:** Offer a "Service Package" discount of 10% for repeat customers to build loyalty.`,

  tips: `**🚀 Tips to Grow Your Motorcycle Repair Workshop**

**1. Build Your Online Presence**
- Keep your Finding Moto profile updated with all services
- Upload before/after photos of your work
- Respond to all customer reviews promptly

**2. Specialize & Certify**
- Get certified in specific brands (Honda, Yamaha, etc.)
- Offer specialized services (fuel injection tuning, electrical diagnostics)
- Display certificates in your workshop

**3. Customer Experience**
- Provide transparent pricing with written estimates
- Send update messages during repairs
- Offer a waiting area with WiFi/refreshments

**4. Service Packages**
- Create tiered service packages (Basic, Standard, Premium)
- Offer pre-paid maintenance plans (6-month/annual)
- Bundle popular services for better value

**5. Expand Revenue Streams**
- Stock fast-moving spare parts for quick repairs
- Offer mobile/roadside assistance
- Partner with insurance companies for claim repairs

**6. Marketing**
- Ask satisfied customers for Google/Finding Moto reviews
- Post weekly tips on social media
- Offer referral discounts (LKR 500 off for each referral)

📈 Workshops using these strategies report 40% growth in the first 6 months.`,

  technical: `**Step-by-Step: Motorcycle Clutch Kit Replacement**

---

🔧 **Tools Required:**
- Socket wrench set
- Clutch holder tool
- Torque wrench
- Gasket scraper
- New clutch kit (friction plates, steel plates, springs)

**Procedure:**

**Step 1: Preparation**
- Place bike on center stand/lift
- Drain engine oil completely
- Remove right-side fairing/cover if applicable

**Step 2: Remove Clutch Cover**
- Remove all cover bolts (note different lengths)
- Carefully remove cover (may need gentle tapping)
- Remove old gasket material

**Step 3: Remove Clutch Assembly**
- Remove clutch springs (4-6 bolts)
- Remove pressure plate
- Pull out friction and steel plates one by one
- Note the order and orientation

**Step 4: Inspect & Install New Parts**
- Soak new friction plates in engine oil for 30 minutes
- Check clutch basket for grooves/notches
- Install plates in correct order (friction-steel-friction...)
- Replace springs if included in kit

**Step 5: Reassemble**
- Apply new gasket/liquid gasket
- Replace clutch cover
- Torque bolts to spec (8-12 Nm typically)
- Refill engine oil

**Step 6: Test**
- Check clutch lever free play
- Start engine, test engagement
- Road test at low speed first

⚠️ **Pro Tip:** Always replace the gasket. Reusing old gaskets causes leaks.

💰 **Typical charge for this job:** LKR 5,000 - 8,000 (labour) + parts`,
};

function getAIResponse(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.includes("diagnos") || lower.includes("overheat") || lower.includes("problem") || lower.includes("issue") || lower.includes("fault")) return aiResponses.diagnosis;
  if (lower.includes("quote") || lower.includes("service") || lower.includes("estimate") || lower.includes("price")) return aiResponses.quote;
  if (lower.includes("tip") || lower.includes("grow") || lower.includes("business") || lower.includes("market")) return aiResponses.tips;
  if (lower.includes("guide") || lower.includes("step") || lower.includes("replac") || lower.includes("how to") || lower.includes("technical")) return aiResponses.technical;
  return `Great question! Here are some thoughts:\n\n${aiResponses.tips}\n\nFeel free to ask about **repair diagnostics**, **service quotes**, or **technical guides** for more specific help!`;
}

// ─── AI Chat Page ───────────────────────────────────────────────────────────
export default function MechanicAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: "assistant",
      text: "👋 Hello! I'm your AI workshop assistant. I can help you with:\n\n• **Repair diagnostics** for common vehicle issues\n• **Service quotes** and estimates\n• **Business tips** to grow your workshop\n• **Technical guides** for repair procedures\n\nTry one of the quick actions below, or ask me anything!",
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center shadow-lg">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Workshop Assistant</h1>
            <p className="text-sm text-muted-foreground">Powered by AI - Get smart diagnostics and business tips</p>
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
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                      msg.role === "user"
                        ? "bg-amber-600 text-white rounded-br-md"
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
                    <div className="w-8 h-8 rounded-lg bg-amber-600/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-amber-600">You</span>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
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
                  placeholder="Ask about diagnostics, service quotes, technical guides..."
                  disabled={isTyping}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="p-2.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-600/25"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                AI responses are for guidance only. Always verify diagnostics with hands-on inspection.
              </p>
            </div>
          </Card>
        </div>

        {/* Sidebar - Suggestions */}
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" /> Suggested Prompts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                "Diagnose unusual engine noise on a Yamaha FZ",
                "How to fix a motorcycle electrical short circuit?",
                "Service quote for brake pad replacement",
                "Best practices for motorcycle chain maintenance",
                "How to increase workshop customer retention?",
                "Guide for carburetor cleaning and tuning",
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
                      {action.label === "Repair Diagnosis" && "Diagnose vehicle issues step by step"}
                      {action.label === "Service Quote" && "Generate professional service estimates"}
                      {action.label === "Business Tips" && "Strategies to grow your workshop"}
                      {action.label === "Technical Guide" && "Step-by-step repair procedures"}
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
