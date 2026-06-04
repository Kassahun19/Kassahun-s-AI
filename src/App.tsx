import { useState, useEffect, useRef } from "react";
import { 
  Send, 
  User, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles, 
  BookOpen, 
  Award, 
  MessageSquare, 
  HelpCircle, 
  CheckCircle2, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Code,
  GraduationCap,
  ArrowRight,
  RefreshCw,
  Terminal,
  Cpu,
  Github,
  Linkedin
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message, QuickPrompt } from "./types";

const QUICK_PROMPTS: QuickPrompt[] = [
  { label: "Who is Kassahun?", prompt: "Who is Kassahun Mulatu?", iconName: "user" },
  { label: "What projects has he built?", prompt: "What projects has Kassahun built?", iconName: "briefcase" },
  { label: "Describe Ezana Academy", prompt: "Can you tell me about Ezana Academy, its courses, and Kassahun's educational mission?", iconName: "book" },
  { label: "How can I contact him?", prompt: "How can I contact Kassahun? Give me his email, phone number, and physical coordinates.", iconName: "mail" },
  { label: "What services does he offer?", prompt: "What services and developer offerings does Kassahun list on kmdev.vercel.app?", iconName: "sparkles" },
];

// Helper to manually render basic Markdown characters cleanly without needing external dependencies
function FormattedMessage({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-300">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        
        // Headers (e.g. ### Heading)
        if (trimmed.startsWith('###')) {
          return (
            <h4 key={idx} className="font-display font-semibold text-white text-base mt-4 mb-2 flex items-center gap-1.5 border-b border-slate-800 pb-1">
              <Sparkles className="w-4 h-4 text-sky-400" />
              {trimmed.replace(/^###\s*/, '')}
            </h4>
          );
        }
        if (trimmed.startsWith('##')) {
          return (
            <h3 key={idx} className="font-display font-bold text-white text-lg mt-5 mb-2.5 flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-blue-500" />
              {trimmed.replace(/^##\s*/, '')}
            </h3>
          );
        }
        if (trimmed.startsWith('#')) {
          return (
            <h2 key={idx} className="font-display font-black text-white text-xl mt-6 mb-3 border-l-4 border-blue-600 pl-2">
              {trimmed.replace(/^#\s*/, '')}
            </h2>
          );
        }

        // Bullet lists (e.g. * Item or - Item)
        if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
          const itemText = trimmed.replace(/^[\*\-]\s*/, '');
          // Parse bold markers within the list item
          return (
            <div key={idx} className="flex items-start gap-2 pl-4 py-0.5">
              <span className="text-sky-500 font-bold select-none h-5 flex items-center">•</span>
              <span className="flex-1">{renderBoldText(itemText)}</span>
            </div>
          );
        }

        // Horizontal Line
        if (trimmed === '---') {
          return <hr key={idx} className="border-slate-800 my-4" />;
        }

        // Standard Paragraphs
        if (trimmed === '') {
          return <div key={idx} className="h-2" />;
        }

        return (
          <p key={idx} className="mb-1 text-slate-300">
            {renderBoldText(line)}
          </p>
        );
      })}
    </div>
  );
}

// Function to handle inline **bolding**
function renderBoldText(str: string) {
  const parts = str.split(/\*\*([^*]+)\*\*/g);
  if (parts.length === 1) return str;
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return <strong key={i} className="font-semibold text-white text-[14.5px] bg-sky-950/20 px-1 py-0.5 rounded border border-sky-900/10">{part}</strong>;
    }
    return part;
  });
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [kbLoaded, setKbLoaded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message on mount
  useEffect(() => {
    const welcomeId = "welcome-" + Date.now();
    setMessages([
      {
        id: welcomeId,
        role: "assistant",
        content: `### Welcome to Kassahun's AI! 👋\n\nI am the premium digital representation of **Kassahun Mulatu**, designed to represent and answer your questions directly from his official platforms.\n\n*   **Learn About Me**: Ask about my full-stack programming background, MSc level topics, Electrical Engineering qualifications, or contact links.\n*   **Ezana Academy**: Find out how I grew our learning platform of mathematics, developer courses, and English to **over 1,500 students nationwide**.\n*   **MERN Solutions**: Inquire about premium software engineering, custom database integrations, and freelance offerings.\n\nWhat would you like to explore about my professional ecosystem? You can select any query below or type your own!`,
        timestamp: new Date()
      }
    ]);
  }, []);

  // Safe scroll-to-bottom anchor
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: "user-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputVal("");
    setIsLoading(true);

    try {
      const chatConversation = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatConversation })
      });

      if (!res.ok) {
        const errObj = await res.json();
        throw new Error(errObj.error || "Failed to reach AI api gateway");
      }

      const data = await res.json();
      
      setMessages((prev) => [
        ...prev,
        {
          id: "ai-" + Date.now(),
          role: "assistant",
          content: data.content,
          timestamp: new Date()
        }
      ]);
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: "error-" + Date.now(),
          role: "assistant",
          content: `### Connection Error 🛑\n\nI couldn't fulfill your request at this moment. This typically occurs if the **Gemini API key** is missing or inactive on our server.\n\n**To resolve this:**\n*   Please confirm that you have set your \`GEMINI_API_KEY\` in the **Settings > Secrets** panel in AI Studio.\n*   If it continues, double check your dev server logger.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const welcomeId = "welcome-" + Date.now();
    setMessages([
      {
        id: welcomeId,
        role: "assistant",
        content: `### Chat Cleared ✨\n\nWelcome back! Let's resume exploring Kassahun Mulatu's digital ecosystem, full-stack projects, and tutoring services.\n\nAsk me anything! For example: **"What projects has he built?"**`,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans relative overflow-hidden selection:bg-blue-600/30 selection:text-white">
      {/* Dynamic Grid Background Core */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111726_1px,transparent_1px),linear-gradient(to_bottom,#111726_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-blue-600/10 to-indigo-600/5 rounded-full blur-[100px] glow-bg pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-sky-600/10 to-purple-600/5 rounded-full blur-[100px] glow-bg pointer-events-none" />

      {/* Main Single-View Structural Layout - Header */}
      <header className="border-b border-slate-900/80 bg-[#080c14]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-display font-bold tracking-tight shadow-lg shadow-blue-500/10 border border-blue-400/20 relative group overflow-hidden">
            <span className="relative z-10 text-sm">KM</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">Kassahun's AI</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                Official Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span>Digital representation of Kassahun Mulatu Kebede</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={clearChat}
            title="Reset Conversation"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono"
            id="clear-chat-btn"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Reset AI Voice</span>
          </button>
        </div>
      </header>

      {/* Core Responsive Content Frame (Single-Screen Multi-Grid Container) */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 min-h-[calc(100vh-80px)] xl:min-h-0">
        
        {/* Left Column: Premium Digital Portfolio Identity Card */}
        <section className="lg:col-span-5 flex flex-col gap-5 h-fit lg:sticky lg:top-24">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-slate-900/90 bg-[#0c1220]/60 backdrop-blur-xl p-6 relative overflow-hidden shadow-2xl"
          >
            {/* Embedded details mapping */}
            <div className="absolute top-0 right-0 p-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 relative flex items-center justify-center">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              </div>
            </div>

            {/* Resume Hero Block */}
            <div className="flex items-start gap-4 pb-6 border-b border-slate-900/80">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex flex-col items-center justify-center border border-slate-800 relative overflow-hidden shrink-0">
                {/* Visual Avatar representing Kassahun */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10" />
                <Terminal className="w-7 h-7 text-sky-400 relative z-10" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-xl tracking-tight text-white">
                  Kassahun Mulatu
                </h2>
                <p className="text-xs font-medium text-sky-400 mt-0.5">
                  Senior Full Stack Developer & Educator
                </p>
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Bahir Dar, Ethiopia</span>
                </div>
              </div>
            </div>

            {/* High Level Metrics / Metrics Grid */}
            <div className="py-5 grid grid-cols-2 gap-4 border-b border-slate-900/80">
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                <div className="text-slate-400 text-[11px] uppercase tracking-wider font-mono font-medium">Platform Reach</div>
                <div className="font-display font-bold text-lg text-white mt-0.5 flex items-baseline gap-1">
                  <span>1,500+</span>
                  <span className="text-[10px] text-slate-500 normal-case font-sans">students</span>
                </div>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                <div className="text-slate-400 text-[11px] uppercase tracking-wider font-mono font-medium">Exp & Mentoring</div>
                <div className="font-display font-bold text-lg text-white mt-0.5 flex items-baseline gap-1">
                  <span>5+ Years</span>
                </div>
              </div>
            </div>

            {/* Developer Statement / Motto */}
            <div className="py-4 text-xs italic text-slate-400">
              "I build scalable, modern web solutions adhering to the latest web standards and dedicate my time to teaching others to do the same."
            </div>

            {/* Core Competency Tags */}
            <div className="space-y-3 pt-2">
              <h3 className="text-slate-400 uppercase tracking-widest font-mono text-[10px] font-semibold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-500" />
                <span>Expertise Stack</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {["MERN Stack", "React.js", "Node.js", "Express.js", "MongoDB", "MySQL", "Control Systems", "UI/UX Design"].map((skill) => (
                  <span 
                    key={skill}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900/90 border border-slate-800 text-slate-300 shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Flagship Academic Initiative Information */}
            <div className="mt-5 bg-gradient-to-tr from-blue-950/20 to-indigo-950/10 p-4 rounded-xl border border-blue-900/20">
              <div className="flex items-center gap-2 text-white font-display font-bold text-xs uppercase tracking-wide">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Ezana Academy</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                Ethiopia's premier online platform offering static/dynamic development instruction, English, and Mathematics (Grades 7-12) with video integration and recognized credentials.
              </p>
              <div className="flex items-center gap-2 mt-3 text-[11px] text-sky-400 font-medium font-mono">
                <span className="underline">ezanacamp.vercel.app</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>

          {/* Quick Contact Specs Widget */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-xl border border-slate-900 p-4 bg-[#0a101d]/35 backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {/* Contact links directly */}
            <a 
              href="mailto:kmulatu21@gmail.com"
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-900/60 transition-colors border border-transparent hover:border-slate-800 group"
              title="Mail to Kassahun"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/20 transition-all">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none">Email Address</div>
                <div className="text-xs text-slate-300 font-medium tracking-tight mt-0.5 truncate max-w-[150px]">kmulatu21@gmail.com</div>
              </div>
            </a>

            <div 
              className="flex items-center gap-3 p-2.5 rounded-lg border border-transparent"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none">Callback Hotline</div>
                <div className="text-xs text-slate-300 font-medium tracking-tight mt-0.5">+251 915 508 167</div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Right Column: AI Assistant Chat Interface */}
        <section className="lg:col-span-7 flex flex-col h-[550px] lg:h-[calc(100vh-140px)] min-h-[450px] rounded-2xl border border-slate-900 bg-[#090e18]/80 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          {/* Header Banner for Chat Area */}
          <div className="bg-[#0b1324]/50 border-b border-slate-900/90 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-mono tracking-wider font-semibold text-slate-400 uppercase">Interactive Context Room</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-900/70 border border-slate-800 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium text-slate-400">
              <span>Model: gemini-3.5-flash</span>
            </div>
          </div>

          {/* Conversation History Scroller */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => {
                const isAI = msg.role === "assistant";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-3.5 ${isAI ? "" : "flex-row-reverse"}`}
                  >
                    {/* Speaker Avatar Icon */}
                    <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 shadow ${
                      isAI 
                        ? "bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold" 
                        : "bg-slate-900 border border-slate-800 text-slate-300"
                    }`}>
                      {isAI ? (
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>

                    {/* Chat Bubble context block */}
                    <div className={`flex flex-col max-w-[85%] ${isAI ? "" : "items-end"}`}>
                      <div className={`rounded-2xl px-4 py-3.5 border ${
                        isAI 
                          ? "bg-[#0c1220]/75 border-slate-900/60 shadow-md text-slate-300" 
                          : "bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-500/10 text-white shadow-lg shadow-blue-500/5 text-sm font-medium leading-relaxed"
                      }`}>
                        {isAI ? (
                          <FormattedMessage text={msg.content} />
                        ) : (
                          <p>{msg.content}</p>
                        )}
                      </div>

                      {/* Display readable timestamp */}
                      <span className="text-[9.5px] font-mono text-slate-600 mt-1 px-1.5">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Typing Skeleton Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3.5"
              >
                <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-blue-600/60 to-indigo-500/60 text-white flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-300" />
                </div>
                <div className="rounded-2xl px-5 py-4 bg-[#0c1220]/75 border border-slate-900/60 shadow max-w-[85%]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-xs font-mono text-slate-500 ml-1.5">Thinking in Kassahun's voice...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Segment (Scrollable suggestion pills above input) */}
          <div className="px-4 py-2 bg-slate-950/20 border-t border-slate-900/60">
            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest pl-1 mb-2">Frequently Asked Suggested Prompts</div>
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1.5 scrollbar-thin">
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  disabled={isLoading}
                  onClick={() => handleSend(qp.prompt)}
                  className="px-3.5 py-1.5 rounded-xl text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5 shrink-0 disabled:opacity-50 disabled:pointer-events-none active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{qp.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Chat Input Area */}
          <div className="p-4 bg-[#070c14] border-t border-slate-900">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputVal);
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask representing Kassahun... e.g. What math topics are in Grade 12 prep?"
                disabled={isLoading}
                className="w-full bg-[#0c1220]/80 placeholder:text-slate-600 text-slate-200 text-sm rounded-xl pl-4 pr-14 py-3.5 border border-slate-900 focus:border-blue-600/60 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-inner"
                id="message-input-el"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isLoading}
                className="absolute right-2 px-3 py-2 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/10 flex items-center justify-center active:scale-95 border border-blue-400/10"
                id="message-send-btn"
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-[10px] text-slate-600 text-center mt-2 font-mono">
              Empowered by Kassahun's official sites. Under strict developer limits.
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
