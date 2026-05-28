import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Loader2, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type Msg = { id: number; role: "user" | "ai"; text: string; ts: number };

const SUGGESTED_PROMPTS = [
  "Summarize my pending tasks",
  "Who is out of office this week?",
  "Draft a recognition message for my team",
  "What's my time-off balance?",
];

interface AiAssistantProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPrompt?: string | null;
  onPromptConsumed?: () => void;
}

export function AiAssistant({ open, onOpenChange, initialPrompt, onPromptConsumed }: AiAssistantProps) {
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([
        {
          id: 1,
          role: "ai",
          text: `Hi ${user?.name?.split(" ")[0] ?? "there"} 👋  I'm your Dejoiy AI copilot. I can summarize work, draft messages, surface insights, or jump you anywhere. What's on your mind?`,
          ts: Date.now(),
        },
      ]);
    }
  }, [open, user, msgs.length]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (initialPrompt && open) {
      send(initialPrompt);
      onPromptConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, thinking]);

  const send = async (text: string) => {
    if (thinking) return;
    const q = text.trim();
    if (!q) return;
    const userMsg: Msg = { id: Date.now(), role: "user", text: q, ts: Date.now() };
    setMsgs((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    const reply = await mockAiReply(q, user?.name ?? "there");
    setMsgs((m) => [...m, { id: Date.now() + 1, role: "ai", text: reply, ts: Date.now() }]);
    setThinking(false);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <>
      {/* Floating launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.4 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onOpenChange(true)}
            className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 shadow-[0_10px_40px_-10px_rgba(99,102,241,0.7)] flex items-center justify-center group"
            aria-label="Open AI Assistant"
            data-testid="ai-assistant-launcher"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 animate-pulse opacity-50 blur-xl" />
            <Sparkles className="w-6 h-6 text-white relative z-10 drop-shadow" strokeWidth={2.2} />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-zinc-950 animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex sm:items-end sm:justify-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-0" onClick={() => onOpenChange(false)} />
            <motion.div
              initial={{ x: 50, y: 50, opacity: 0, scale: 0.95 }}
              animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              exit={{ x: 50, y: 50, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.18 }}
              role="dialog"
              aria-modal="true"
              aria-label="Dejoiy AI Assistant"
              className="relative w-full sm:max-w-md sm:m-5 h-full sm:h-[640px] sm:max-h-[80vh] bg-white/95 dark:bg-zinc-950/90 backdrop-blur-2xl border border-white/30 dark:border-white/10 sm:rounded-3xl shadow-[0_30px_80px_-20px_rgba(99,102,241,0.5)] flex flex-col overflow-hidden"
              data-testid="ai-assistant-panel"
            >
              {/* Ambient glow */}
              <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-violet-500/30 to-blue-500/20 blur-3xl rounded-full" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-cyan-400/20 to-blue-500/10 blur-3xl rounded-full" />

              {/* Header */}
              <div className="relative flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white dark:ring-zinc-950" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">Dejoiy AI</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Always learning · Multilingual</p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                  aria-label="Close"
                >
                  <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 sm:hidden" />
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400 hidden sm:block" />
                </button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-5 py-5 space-y-4">
                {msgs.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-violet-500 text-white rounded-br-md shadow-md"
                          : "bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-100 rounded-bl-md border border-gray-200/60 dark:border-white/10"
                      }`}
                    >
                      {m.text}
                    </div>
                  </motion.div>
                ))}
                {thinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 dark:bg-white/5 px-4 py-3 rounded-2xl rounded-bl-md border border-gray-200/60 dark:border-white/10 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </motion.div>
                )}

                {msgs.length <= 1 && !thinking && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">Try asking</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_PROMPTS.map((p) => (
                        <button
                          key={p}
                          onClick={() => send(p)}
                          className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:border-violet-300 dark:hover:border-violet-500/50 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="relative px-3 pb-3 pt-2 border-t border-gray-100 dark:border-white/5 bg-white/60 dark:bg-zinc-950/40 backdrop-blur">
                <div className="flex items-end gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl p-2 focus-within:border-violet-400 dark:focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/15 transition">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask anything…"
                    className="flex-1 bg-transparent outline-none resize-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 px-2 py-1.5 max-h-32"
                    data-testid="ai-assistant-input"
                  />
                  <button
                    onClick={() => send(input)}
                    disabled={!input.trim() || thinking}
                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/30 transition"
                    aria-label="Send"
                  >
                    {thinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-center text-gray-400 dark:text-gray-500 mt-2">
                  Dejoiy AI · responses are simulated in demo mode
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

async function mockAiReply(q: string, name: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 700 + Math.random() * 700));
  const lower = q.toLowerCase();

  if (lower.includes("task") || lower.includes("pending") || lower.includes("todo")) {
    return `Here's a quick read on your tasks, ${name.split(" ")[0]}:\n\n• 3 items are due this week — 1 is overdue.\n• Highest priority: "Q2 Performance Review – self assessment".\n• AI suggestion: block 45 min tomorrow morning to clear the overdue item.\n\nWant me to open My Tasks?`;
  }
  if (lower.includes("leave") || lower.includes("out of office") || lower.includes("absent") || lower.includes("time off")) {
    return `Looking at your team's calendar next week:\n\n• 2 people are on approved leave (Mon–Wed)\n• 1 conference travel (Thu)\n• Your remaining time-off balance: 12 days\n\nShall I draft a leave request or open the Time Off page?`;
  }
  if (lower.includes("payslip") || lower.includes("salary") || lower.includes("pay")) {
    return `Your latest payslip is available in the Payroll module. YTD highlights:\n\n• Gross earnings: trending +6% vs. last year\n• Tax withholding: on track\n• Next pay date: end of month\n\nI can open the full breakdown if you'd like.`;
  }
  if (lower.includes("okr") || lower.includes("goal") || lower.includes("performance")) {
    return `OKR snapshot for this quarter:\n\n• 4 of 6 key results are on track ✅\n• 1 is at risk (needs check-in)\n• 1 was just completed 🎉\n\nGrowth tip: spending ~15% more time on focused work weeks correlates with your highest KR completion.`;
  }
  if (lower.includes("summarize") || lower.includes("summary") || lower.includes("week")) {
    return `Here's your week at a glance:\n\n📈 Productivity score: 84 (+6 vs. last week)\n✅ 12 tasks completed\n🤝 6 meetings · ~4h saved by AI summaries\n🎯 2 OKR key results advanced\n\nNice momentum — keep it going!`;
  }
  if (lower.includes("draft") || lower.includes("message") || lower.includes("email") || lower.includes("thank")) {
    return `Here's a draft you can send:\n\n"Team, I wanted to take a moment to recognize the energy and craft you brought this week. The way you stepped up under deadline pressure was the difference. Grateful to build with you all. — ${name.split(" ")[0]}"\n\nWant me to make it more formal or shorter?`;
  }
  if (lower.includes("hire") || lower.includes("candidate") || lower.includes("recruit")) {
    return `Recruitment pipeline pulse:\n\n• 4 open roles\n• 28 candidates active\n• 5 in final-round interviews\n• Best match this week: a senior frontend candidate scoring 92% on your role profile.`;
  }
  if (lower.includes("hello") || lower.includes("hi ") || lower === "hi" || lower.includes("hey")) {
    return `Hey ${name.split(" ")[0]}! Ready when you are. I can summarize anything in your workspace, draft messages, surface analytics, or jump you to a module. What would help right now?`;
  }
  return `Thinking about "${q}"…\n\nIn the live version I'd pull from your live workspace data and answer with citations. For now, here's a smart starting point:\n\n• I can summarize tasks, leave, payroll, OKRs, and recruitment\n• I can draft messages, emails, and recognition notes\n• I can predict workforce risks and propose automations\n\nTry asking: "Summarize this week" or "Who is on leave next week?"`;
}
